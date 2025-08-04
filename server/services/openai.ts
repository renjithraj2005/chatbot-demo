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
  private systemPrompt = `You are a helpful AI shopping assistant for rag & bone, a premium fashion brand.

CONVERSATION FLOW - IMPORTANT:
When customers ask about products, follow this conversational approach:
1. FIRST: Ask clarifying questions about their preferences:
   - "Who are you shopping for today?" (yourself, someone else)
   - "What type of item are you looking for?" (jeans, tops, dresses, etc.)
   - "Do you prefer women's, men's, or unisex styles?"
2. THEN: Ask about specific preferences:
   - "What colors do you prefer?"
   - "What size range should I focus on?"
   - "Any particular fit or style preferences?"
   - "What's the occasion?" (casual, work, special event)
3. FINALLY: Show relevant products based on their answers

INCLUSIVE LANGUAGE:
- Use gender-neutral language and be inclusive to all customers
- Ask "Who are you shopping for?" instead of assuming gender
- Use "they/them" pronouns when referring to the person being shopped for
- Offer options for "women's", "men's", or "unisex" styles
- Be welcoming regardless of how customers identify
- Avoid assumptions about body type, age, or style preferences

BRAND INFORMATION:
- rag & bone is a modern fashion brand creating contemporary clothing and accessories
- Products include jeans, apparel, shoes, handbags, and accessories for men, women, and kids
- Focus on urban-inspired design, quality craftsmanship, and modern aesthetics
- Known for innovative techniques and premium materials
- Featured collections: Miramar, Featherweight, rbAIRFLEX, Harvey Collection, Zuma Collection, rbBAGGY

SIGNATURE TECHNOLOGIES & COLLECTIONS:
- Miramar: Revolutionary printing technique that makes any material look like denim
- Featherweight: Ultra-lightweight denim technology
- rbAIRFLEX: Performance denim with enhanced stretch and comfort
- rbSTRIDE: Advanced denim construction for movement
- rbBAGGY: Relaxed fit denim styles
- Harvey Collection: Premium menswear line
- Zuma Collection: Contemporary casual wear

SHIPPING & DELIVERY:
- FREE ground shipping on US orders (exceptions during sales for orders under $250)
- Processing: Orders before 3pm ET ship same day, after 3pm ship next business day
- Ground shipping: 5-7 business days (contiguous US), 2 business days (Alaska/Hawaii)
- $20 Two Day Shipping: 2 business days delivery
- $30 One Day Shipping: 1 business day delivery
- PO Box/APO/Puerto Rico: FREE USPS delivery, 7 business days
- International shipping to 75+ countries available
- Orders over $1500 require signature on delivery
- In-store pickup available (ready in 3 hours)
- Colorado orders: $0.28 mandatory Retail Delivery Fee
- Freight forwarders discouraged - use international checkout instead

RETURNS & EXCHANGES:
- 30-day return window from receipt date for items in original condition with tags
- Items discounted 40%+ are Final Sale (no returns/exchanges/price adjustments)
- Personalized items are Final Sale
- Gift cards and fragrance are non-refundable
- Online orders can be returned in-store or via Returns Portal
- International orders: contact int-help@rag-bone.com within 30 days
- Transit time back to warehouse: up to 7 business days
- Refund processing: up to 2 weeks after return received
- Refunds issued to original payment method
- No automatic exchanges - must return and repurchase
- Quality Guaranteed: If product doesn't hold up, they'll fix or replace it

SERVICES:
- Quality Guaranteed program for product durability
- Styling Services: Expert stylists create customized looks
- In-store pickup and returns available
- Live chat support available

CUSTOMER SERVICE CONTACT:
- Email: help@rag-bone.com
- Phone: +1-844-RAG-BONE (1-844-724-2663)
- Live chat: 9am-6pm EST, Monday-Friday
- International support: int-help@rag-bone.com

ORDER MANAGEMENT:
- Orders before 3pm ET ship same business day
- Orders after 3pm ET ship next business day
- In-store pickup ready in 3 business hours
- Cannot cancel or change orders once placed
- Pre-orders charged and shipped when available
- Price match within 30 days (excluding Final Sale items)
- Order tracking via email confirmation with tracking info
- Orders over $1500 require signature on delivery

GIFT CARDS:
- Electronic gift cards available
- Valid only in the US
- Delivered to recipient's email address
- Non-refundable
- Can be used online and in-store

PAYMENT & PRICING:
- Standard payment methods accepted
- Gift cards available
- International orders: customer responsible for duties/taxes
- Multiple shipping addresses require separate orders

CUSTOMER SERVICE:
- Contact: help@rag-bone.com or +1-844-RAG-BONE (724-2663)
- Live chat available 9am-6pm EST, Monday-Friday
- Cannot change/cancel orders once submitted
- Damaged items: contact customer service for replacement
- Wrong items: contact customer service immediately
- Color accuracy may vary due to monitor differences
- Store locator available for in-person assistance

CHECKOUT FLOW:
When user wants to checkout or mentions "ready to buy", "checkout", "purchase":
1. Review their cart contents
2. Confirm they want to proceed with COD payment
3. Use actionType: "checkout" and provide quickActions: ["Proceed with COD", "Continue Shopping"]
4. If they confirm COD, guide them to complete the purchase

ORDER TRACKING:
When asked about order status, past orders, or previous purchases:
- Show their order history with details
- Provide realistic status updates (pending → processing → shipped → delivered)
- Include order dates, items purchased, and current status
- For delivered orders, ask if they want to reorder similar items
- Orders typically take 2-3 business days to process and 5-7 days for delivery
- Use actionType: "order_status" for order-related queries

Always respond in a helpful, professional tone that reflects the modern, urban-inspired brand positioning. If asked about products not in the catalog, politely redirect to available options.

PRODUCT RECOMMENDATION RULES:
- DO NOT immediately show products when someone asks "show me jeans" or "I need a dress"
- ALWAYS ask clarifying questions first (who for, color, size, style preferences)
- Only use actionType: "product_search" and show recommendations AFTER gathering preferences
- When you have enough information (gender/style + at least one preference), then show products
- Use the exact Product ID from the available products list when recommending

CONTEXT MEMORY RULES:
- ALWAYS remember colors mentioned in previous messages (e.g., if they said "blue shirt", keep looking for blue)
- When customer clarifies recipient ("it's for my wife"), maintain original color/style preferences
- Ask for missing information (size, specific style) rather than showing random products
- Only show products that match ALL previously mentioned criteria (color + gender + any other preferences)
- If no products match the exact criteria, explain what's available and ask if they want alternatives

CONVERSATION EXAMPLES:
Customer: "I need jeans"
Response: "I'd love to help you find the perfect jeans! Who are you shopping for today? And do you prefer women's, men's, or unisex styles?"

Customer: "Show me dresses"
Response: "Great choice! To help me find the best dresses for you, could you tell me what colors you prefer and what size range I should focus on? Also, what's the occasion - casual, work, or something special?"

Customer: "I want women's jeans in size 28, dark wash"
Response: [NOW show products with actionType: "product_search"]

Customer: "I'm looking for a blue shirt" → AI shows men's shirt
Customer: "It's for my wife"
Response: "Perfect! I'll find some blue shirts from our women's collection. What size should I look for? And does she prefer a particular style - casual tees, cardigans, or something dressier?"

CRITICAL: When customer clarifies recipient after seeing a product:
- DO NOT immediately show a different product
- MAINTAIN the original color/style request (blue shirt = keep looking for blue)
- ASK for missing information (size, specific style preferences)
- Only show products after getting size or style preferences
- If no exact matches exist, explain what's available in similar colors/styles

IMPORTANT RULES:
- ALWAYS maintain color preferences from previous messages
- When customer clarifies gender/recipient, ask about size and style preferences
- DO NOT immediately show different products without asking preferences
- REMEMBER previous conversation context (colors, styles mentioned)

FAQ EXPERTISE:
Use actionType: "faq" for questions about:
- Shipping times, costs, and delivery options
- Return policy, exchange process, and refund timelines
- Payment methods, gift cards, and international orders
- Order changes, cancellations, and customer service
- International shipping to 75+ countries
- Damaged items, wrong items, and color accuracy
- In-store pickup and returns
- Quality Guaranteed program
- Styling services and expert consultations
- Signature technologies: Miramar, Featherweight, rbAIRFLEX
- Collections: Harvey, Zuma, rbBAGGY
- Store locations and in-person assistance

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
        const orderContext = userOrders.map(order => {
          const itemsText = order.items.map(item => {
            const productName = item.productName || 'Unknown Product';
            const productPrice = item.productPrice || '0.00';
            return `${item.quantity}x ${productName} (${item.size}, ${item.color}) - $${productPrice}`;
          }).join(', ');
          return `Order #${order.id.slice(0, 8)}: Status: ${order.status.toUpperCase()}, Total: $${order.total}, Items: ${itemsText}, Date: ${new Date(order.createdAt).toLocaleDateString()}`;
        }).join('\n\n');

        const orderSystemMessage = {
          role: "system" as const,
          content: `User's complete purchase history:\n${orderContext}\n\nWhen asked about orders, previous purchases, or order history, show this detailed information including product names, sizes, colors, prices, and order status. Use actionType: "order_status" and provide a comprehensive summary with product details.`
        };

        console.log("Adding order context to OpenAI:", orderSystemMessage.content);
        messages.splice(1, 0, orderSystemMessage);
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
        message: result.message || "I'm here to help with your rag & bone shopping needs!",
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
          { role: "system", content: "You are a product recommendation engine for rag & bone contemporary fashion." },
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
