import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatbotService, type ChatMessage } from "./services/openai";
import { 
  insertProductSchema, 
  insertCartItemSchema, 
  insertConversationSchema,
  insertOrderSchema 
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session management middleware
  app.use((req, res, next) => {
    if (!req.headers['x-session-id']) {
      req.headers['x-session-id'] = randomUUID();
    }
    next();
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, gender } = req.query;
      let products = await storage.getProducts();
      
      if (category) {
        products = products.filter(p => p.category === category);
      }
      if (gender) {
        products = products.filter(p => p.gender === gender || p.gender === 'unisex');
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await storage.getCartItems(sessionId);
      
      // Enrich cart items with product details
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      const total = enrichedItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product?.price || "0") * item.quantity);
      }, 0);
      
      res.json({
        items: enrichedItems,
        total: total.toFixed(2),
        itemCount: enrichedItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      
      const cartItem = await storage.addToCart(cartData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Chatbot API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      const sessionId = req.headers['x-session-id'] as string;
      
      let conversation;
      let conversationHistory: ChatMessage[] = [];
      
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (conversation) {
          conversationHistory = conversation.messages as ChatMessage[];
        }
      }
      
      if (!conversation) {
        conversation = await storage.createConversation({
          sessionId,
          messages: [],
          status: "active"
        });
      }
      
      // Get available products for context
      const products = await storage.getProducts();
      
      // Process message with OpenAI
      const response = await chatbotService.processMessage(
        message,
        conversationHistory,
        products
      );
      
      // Update conversation history
      const updatedMessages = [
        ...conversationHistory,
        { role: "user" as const, content: message, timestamp: new Date() },
        { role: "assistant" as const, content: response.message, timestamp: new Date() }
      ];
      
      await storage.updateConversation(conversation.id, {
        messages: updatedMessages
      });
      
      // Update analytics
      const analytics = await storage.getAnalytics();
      if (analytics && analytics.totalConversations !== null) {
        await storage.updateAnalytics({
          totalConversations: analytics.totalConversations + 1
        });
      }
      
      res.json({
        conversationId: conversation.id,
        response: response.message,
        recommendations: response.recommendations || [],
        actionType: response.actionType,
        quickActions: response.quickActions || []
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Orders API
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      const total = await cartItems.reduce(async (sumPromise, item) => {
        const sum = await sumPromise;
        const product = await storage.getProduct(item.productId);
        return sum + (parseFloat(product?.price || "0") * item.quantity);
      }, Promise.resolve(0));
      
      const orderData = insertOrderSchema.parse({
        sessionId,
        status: "pending",
        total: total.toFixed(2),
        items: cartItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod || "cod",
        codAmount: req.body.paymentMethod === "cod" ? total.toFixed(2) : null
      });
      
      const order = await storage.createOrder(orderData);
      
      // Clear cart after successful order
      await storage.clearCart(sessionId);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Analytics API
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Product recommendations API
  app.post("/api/recommendations", async (req, res) => {
    try {
      const preferences = req.body;
      const products = await storage.getProducts();
      
      const recommendations = await chatbotService.generateProductRecommendations(
        preferences,
        products
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
