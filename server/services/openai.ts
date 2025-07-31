import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface ProductRecommendation {
  productId: string;
  reason: string;
  confidence: number;
  product?: {
    name: string;
    price: string;
    image: string;
    description: string;
  };
}

export interface ChatbotResponse {
  message: string;
  recommendations?: ProductRecommendation[];
  actionType?: "product_search" | "order_status" | "size_guide" | "faq" | "general" | "checkout" | "cart_review";
  quickActions?: string[];
}

export class ChatbotService {
  private systemPrompt = `You are a helpful AI shopping assistant for DL1961, a premium sustainable denim brand.

Key brand information:
- DL1961 specializes in premium, sustainable denim using 89% less water in production
- Products include jeans, jackets, and casual wear for men, women, and kids
- Focus on comfort, fit, and eco-conscious design
- Vertical integration from fiber to finished product

Your role:
- Help customers find the perfect jeans and clothing
- Provide product recommendations based on their needs
- Answer questions about sizing, sustainability, care instructions
- Assist with order tracking and returns
- Handle checkout process with Cash on Delivery (COD) payment
- Be friendly, knowledgeable, and focused on sustainability

CHECKOUT FLOW:
When user wants to checkout or mentions "ready to buy", "checkout", "purchase":
1. Review their cart contents
2. Confirm they want to proceed with COD payment
3. Use actionType: "checkout" and provide quickActions: ["Proceed with COD", "Continue Shopping"]
4. If they confirm COD, guide them to complete the purchase

ORDER TRACKING:
When asked about order status:
- Check their recent orders
- Provide realistic status updates (pending → processing → shipped → delivered)
- Orders typically take 2-3 business days to process and 5-7 days for delivery

Always respond in a helpful, professional tone that reflects the premium brand positioning. If asked about products not in the catalog, politely redirect to available options.

When recommending products, use the exact Product ID from the available products list.

Respond with JSON in this format:
{
  "message": "your response message",
  "actionType": "product_search|order_status|size_guide|faq|general|checkout|cart_review",
  "recommendations": [{"productId": "exact-uuid-from-products-list", "reason": "why recommended", "confidence": 0.8}],
  "quickActions": ["optional array of quick action suggestions"]
}`;

  async processMessage(
    message: string,
    conversationHistory: ChatMessage[],
    availableProducts: any[],
    userOrders: any[] = [],
    cartItems: any[] = []
  ): Promise<ChatbotResponse> {
    try {
      const messages = [
        { role: "system" as const, content: this.systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user" as const, content: message }
      ];

      // Add product context if relevant
      const productContext = availableProducts.map(p => 
        `Product ID: ${p.id}\nName: ${p.name}\nCategory: ${p.category}\nGender: ${p.gender}\nPrice: $${p.price}\nDescription: ${p.description}\n---`
      ).join('\n');

      if (availableProducts.length > 0) {
        messages.splice(1, 0, {
          role: "system" as const,
          content: `Available products (use exact Product ID in recommendations):\n${productContext}\n\nIMPORTANT: When making recommendations, use the exact Product ID from above.`
        });
      }

      // Add user order context if they have any orders
      if (userOrders.length > 0) {
        const orderContext = userOrders.map(order =>
          `Order #${order.id.slice(0, 8)}: Status: ${order.status}, Total: $${order.total}, Created: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join('\n');

        messages.splice(1, 0, {
          role: "system" as const,
          content: `User's recent orders:\n${orderContext}\n\nWhen asked about orders, show this information directly without asking for email.`
        });
      }

      // Add cart context if they have items in cart
      if (cartItems.length > 0) {
        const cartContext = cartItems.map(item =>
          `Product ID: ${item.productId}, Quantity: ${item.quantity}, Size: ${item.size}, Color: ${item.color}`
        ).join('\n');

        messages.splice(1, 0, {
          role: "system" as const,
          content: `User's current cart:\n${cartContext}\n\nWhen user mentions checkout, buying, or purchasing, help them proceed with COD payment. Use actionType: "checkout" and provide quickActions for COD confirmation.`
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "I'm here to help with your DL1961 shopping needs!",
        actionType: result.actionType || "general",
        recommendations: result.recommendations || [],
        quickActions: result.quickActions || []
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our customer service team.",
        actionType: "general"
      };
    }
  }

  async generateProductRecommendations(
    userPreferences: {
      gender?: string;
      category?: string;
      style?: string;
      size?: string;
      priceRange?: string;
    },
    products: any[]
  ): Promise<ProductRecommendation[]> {
    try {
      const prompt = `Based on these user preferences: ${JSON.stringify(userPreferences)}, 
      recommend the best products from this catalog: ${JSON.stringify(products)}.
      
      Respond with JSON array of recommendations:
      [{"productId": "id", "reason": "explanation", "confidence": 0-1}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a product recommendation engine for DL1961 denim." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error("Recommendation generation error:", error);
      return [];
    }
  }

  async analyzeSentiment(message: string): Promise<{ sentiment: string; confidence: number }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of customer messages. Respond with JSON: {\"sentiment\": \"positive|negative|neutral\", \"confidence\": 0.0-1.0}"
          },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        sentiment: result.sentiment || "neutral",
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return { sentiment: "neutral", confidence: 0.5 };
    }
  }
}

export const chatbotService = new ChatbotService();
