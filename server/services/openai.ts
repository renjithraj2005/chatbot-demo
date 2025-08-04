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

BRAND INFORMATION:
- DL1961 specializes in premium, sustainable denim using 89% less water in production
- Products include jeans, jackets, and casual wear for men, women, and kids
- Focus on comfort, fit, and eco-conscious design
- Vertical integration from fiber to finished product in family-owned factory
- Featured collections: Instasculpt™, SculptSystem, DL Aura, DL Ultimate™, HIGHLUXE™

SUSTAINABILITY & ENVIRONMENTAL IMPACT:
- Water Usage: Only 10 gallons per jean vs industry standard 1,500 gallons
- Water Treatment: Treat and recycle 98% of water used (1M+ gallons/year)
- Energy: Solar panels generate 200kW power, self-generating 15MW capacity
- Carbon Goals: Net-zero by 2040 (The Climate Pledge member), climate-positive by 2026
- Certifications: ZDHC, BSCI, WRAP, Sedex, Higg FSLM, Better Work
- Waterless finishing: Laser and Ozone technologies (no harmful chemicals)
- Dyes: Dystar Liquid Indigo (3 ingredients: indigo, soda, water)

RECOVER™ RECYCLED COTTON:
- Partnership with Recover™ for circular denim production
- Process: Textile waste → Sort → Cut/Extract → Decolorize → Treatment → Shred → New fiber
- Sources: Post-consumer waste (t-shirts, undies, plastic bottles, old jeans)
- Impact: Better for environment than conventional and organic cotton
- Largest textile recycling plant in Asia (family-owned facility)
- 95% of old clothes could be recycled, but only 15% are - DL1961 helps close this gap

SUSTAINABLE FIBERS:
- Recover™ Recycled Cotton: From textile waste and post-consumer materials
- Certified/Organic Cotton: GOTS, OCS certified varieties
- Tencel™ Lyocell: From beech tree wood, 100% biodegradable, ultra-absorbent
- REPREVE® Our Ocean™: From post-consumer plastic bottles diverted from ocean
- Hemp and other renewable/regenerative materials

SHIPPING & DELIVERY:
- FREE shipping on all contiguous US orders (excludes Alaska, Hawaii, US territories)
- Alaska: $30 surcharge, Hawaii: $20 surcharge
- Processing: 1-2 business days, Delivery: 3-7 business days (UPS Ground)
- Expedited options: UPS 3 Day, 2nd Day Air, Next Day Air (extra cost)
- Same-day delivery available in Manhattan, Brooklyn, Long Island City ($25 fee)
- Orders before 11am EST qualify for same-day delivery (4pm-9pm delivery window)
- International shipping available to most countries (DDP basis)
- No PO Box deliveries

RETURNS & EXCHANGES:
- 30-day return window for full-price items (from order fulfillment date)
- Final sale items cannot be returned/exchanged
- Items must be unworn, unwashed, undamaged with original tags
- Returns must be initiated via Returns Portal within 30 days
- CHECKOUT+ option provides package protection and prepaid return labels
- Without CHECKOUT+: customer pays return shipping (deducted from refund)
- Refunds take up to 14 business days, issued to original payment method
- Store credit valid for 5 years
- International returns at customer expense, no exchanges
- Leather products: 10% restocking fee

CHECKOUT+ PROTECTION:
- Package protection for lost, stolen, or damaged items
- Prepaid return shipping labels included
- Automatic replacement for damaged/lost packages at no cost

PAYMENT & PRICING:
- Klarna payment option available (pay in 30 days, no fees when paid on time)
- Gift cards and discount codes accepted (cannot be combined)
- International orders: customer responsible for duties/taxes

LOYALTY PROGRAM:
- FREE to join, automatic enrollment for existing customers
- Earn points for purchases, birthdays, referrals, social media follows
- Point conversion: 20 points = $1 (minimum 200 points to redeem)
- 3 VIP Tiers based on 12-month spending:
  * Tier 1: Sign up (1 point per $1 spent)
  * Tier 2: $850+ spent (1.25 points per $1 spent)
  * Tier 3: $1,500+ spent (1.5 points per $1 spent)
- Benefits: Birthday rewards, VIP access, early sale access, first look at new collections, complimentary styling service, exclusive offers
- Referral program: Give $50 off to friends ($150+ purchase), get 500 points
- Points expire: End of following calendar year, or after 12 months inactivity
- Tier status: Tier 1 never expires, Tier 2/3 expire after 1 year without qualifying spend
- Must be logged in to earn points, points added to returns if order returned

CUSTOMER SERVICE:
- Contact: hello@dl1961.com
- Cannot change/cancel orders once submitted
- Damaged items: email photos within 2 weeks for replacement
- Wrong items: contact customer service immediately
- Color accuracy may vary due to monitor differences

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

Always respond in a helpful, professional tone that reflects the premium brand positioning. If asked about products not in the catalog, politely redirect to available options.

When recommending products, use the exact Product ID from the available products list.

FAQ EXPERTISE:
Use actionType: "faq" for questions about:
- Shipping times, costs, and delivery options
- Return policy, exchange process, and refund timelines
- Payment methods, Klarna, gift cards, discount codes
- Order changes, cancellations, and customer service
- Package protection, CHECKOUT+, and international shipping
- Damaged items, wrong items, and color accuracy
- Same-day delivery in NYC area
- Loyalty program, points earning/redemption, VIP tiers
- Birthday rewards, referral program, tier benefits
- Point expiration, account management, tier status
- Sustainability, environmental impact, water usage, carbon footprint
- Recover™ recycled cotton, circular denim, textile recycling
- Sustainable fibers, Tencel™ Lyocell, organic cotton, REPREVE®
- Factory practices, certifications, ethical manufacturing
- Waterless finishing, laser/ozone technology, eco-friendly dyes

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
