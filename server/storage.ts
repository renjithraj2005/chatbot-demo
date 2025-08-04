import { 
  type User, type InsertUser, 
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Conversation, type InsertConversation,
  type Order, type InsertOrder,
  type Analytics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Conversation methods
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersBySession(sessionId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Analytics methods
  getAnalytics(): Promise<Analytics | undefined>;
  updateAnalytics(data: Partial<Analytics>): Promise<Analytics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private conversations: Map<string, Conversation>;
  private orders: Map<string, Order>;
  private analytics: Analytics;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.conversations = new Map();
    this.orders = new Map();
    
    // Initialize analytics
    this.analytics = {
      id: randomUUID(),
      date: new Date(),
      totalConversations: 1247,
      conversionRate: "24.3",
      avgResponseTime: "1.4",
      customerSatisfaction: "94.8"
    };

    // Initialize sample products
    this.initializeProducts();

    // Initialize sample orders for demo
    this.initializeSampleOrders();
  }

  private initializeProducts() {
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Miramar Tank Dress",
        description: "Revolutionary Miramar printing technique on cotton poplin. Tank dress with modern fit and innovative denim-like appearance.",
        price: "341.00",
        category: "dresses",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WCW25P30037603-436-A/Miramar-Tank-Dress-436?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Seneca", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Poplin", "Tank Style", "Modern Fit"],
        rating: "4.8",
        reviewCount: 89
      },
      {
        id: randomUUID(),
        name: "Logan Wide-Leg Jeans",
        description: "Featherweight denim in bleach stripe with wide-leg silhouette. Modern high-rise fit with ultra-lightweight comfort.",
        price: "313.00",
        category: "jeans",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WDD25P1004RGBS-471-A/Logan-Wide-Leg-Jeans-471?$medium$&fmt=auto",
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31"],
        colors: ["Bleach Stripe", "Indigo", "Black"],
        inStock: true,
        features: ["Featherweight Technology", "Wide-leg fit", "High-rise", "Bleach Stripe"],
        rating: "4.7",
        reviewCount: 156
      },
      {
        id: randomUUID(),
        name: "Miramar Wide-Leg Pants",
        description: "Cotton terry with Miramar printing technique. Wide-leg silhouette with revolutionary denim-like appearance and superior comfort.",
        price: "189.00",
        category: "pants",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/RC1325F7MTE-421-A/Miramar-Wide-Leg-Pants-421?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Lenox Petra Scarlet", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Terry", "Wide-leg fit", "Revolutionary printing"],
        rating: "4.9",
        reviewCount: 203
      },
      {
        id: randomUUID(),
        name: "The Slub Tee",
        description: "Classic striped tee with slub cotton texture. Relaxed fit with modern styling and premium cotton construction for everyday comfort.",
        price: "94.00",
        category: "tops",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WCC22HT012NM12-944-A/The-Slub-Tee-944?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Sunlight Khaki Military Olive Salute", "Black/White", "Navy/White"],
        inStock: true,
        features: ["Slub cotton", "Striped design", "Relaxed fit", "Premium construction"],
        rating: "4.6",
        reviewCount: 178
      },
      {
        id: randomUUID(),
        name: "Spire Mesh Mary Janes",
        description: "Modern Mary Jane shoes with mesh construction. Contemporary design with comfortable fit and versatile styling for everyday wear.",
        price: "265.00",
        category: "shoes",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WFF25PF1024PO24-966-A/Spire-Mesh-Mary-Janes-966?$medium$&fmt=auto",
        sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
        colors: ["Honey", "Black", "White"],
        inStock: true,
        features: ["Mesh construction", "Mary Jane style", "Modern design", "Comfortable fit"],
        rating: "4.5",
        reviewCount: 134
      },
      {
        id: randomUUID(),
        name: "Ezra Open-Knit Cardigan",
        description: "Open-knit cardigan with contemporary styling. Modern fit with premium construction and versatile design for layering.",
        price: "380.00",
        category: "sweaters",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAS25P061FP61-471-A/Ezra-Open-Knit-Cardigan-471?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Indigo", "Black", "Cream"],
        inStock: true,
        features: ["Open-knit design", "Contemporary styling", "Premium construction", "Versatile layering"],
        rating: "4.7",
        reviewCount: 167
      },
      {
        id: randomUUID(),
        name: "Alessia Printed Slip Dress",
        description: "Elegant slip dress with sophisticated print design. Modern silhouette with premium fabric construction and contemporary styling.",
        price: "484.00",
        category: "dresses",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAW25P30348034-978-A/Alessia-Printed-Slip-Dress-978?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black Print", "Navy Print", "Cream Print"],
        inStock: true,
        features: ["Slip dress style", "Sophisticated print", "Premium fabric", "Contemporary styling"],
        rating: "4.6",
        reviewCount: 142
      },
      {
        id: randomUUID(),
        name: "Melo Mini Dress",
        description: "Sophisticated mini dress with modern silhouette. Premium construction with contemporary styling and versatile design.",
        price: "665.00",
        category: "dresses",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAS25P051SL51-001-A/Melo-Mini-Dress-001?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Cream"],
        inStock: true,
        features: ["Mini dress style", "Modern silhouette", "Premium construction", "Contemporary styling"],
        rating: "4.8",
        reviewCount: 89
      },
      {
        id: randomUUID(),
        name: "Blythe Maxi Skirt",
        description: "Elegant maxi skirt with flowing silhouette. Premium fabric construction with modern styling and versatile design for sophisticated looks.",
        price: "284.00",
        category: "skirts",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAW25PB0017601-001-A/Blythe-Maxi-Skirt-001?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Cream"],
        inStock: true,
        features: ["Maxi length", "Flowing silhouette", "Premium fabric", "Modern styling"],
        rating: "4.5",
        reviewCount: 167
      },
      {
        id: randomUUID(),
        name: "Miramar Track Shorts",
        description: "Cotton terry track shorts with Miramar printing technique. Comfortable athletic-inspired design with revolutionary denim-like appearance.",
        price: "132.00",
        category: "shorts",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/RC4525P9MTE-409-A/Miramar-Track-Shorts-409?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Coney", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Terry", "Track style", "Athletic-inspired"],
        rating: "4.5",
        reviewCount: 124
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  private initializeSampleOrders() {
    // Get some product IDs for sample orders
    const productIds = Array.from(this.products.keys());
    const demoSessionId = "demo-session-12345"; // Fixed session ID for demo

    const sampleOrders: Order[] = [
      {
        id: randomUUID(),
        sessionId: demoSessionId,
        status: "delivered",
        total: "179.00",
        items: [{
          id: randomUUID(),
          sessionId: demoSessionId,
          productId: productIds[0], // Florence Skinny
          quantity: 1,
          size: "27",
          color: "Dark Wash",
          createdAt: new Date("2025-01-15")
        }],
        shippingAddress: {
          name: "Demo Customer",
          address: "123 Fashion Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          phone: "+1-555-0123"
        },
        paymentMethod: "cod",
        codAmount: "179.00",
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-22")
      },
      {
        id: randomUUID(),
        sessionId: demoSessionId,
        status: "shipped",
        total: "248.00",
        items: [{
          id: randomUUID(),
          sessionId: demoSessionId,
          productId: productIds[5], // Classic Denim Jacket
          quantity: 1,
          size: "M",
          color: "Indigo",
          createdAt: new Date("2025-01-25")
        }],
        shippingAddress: {
          name: "Demo Customer",
          address: "123 Fashion Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          phone: "+1-555-0123"
        },
        paymentMethod: "cod",
        codAmount: "248.00",
        createdAt: new Date("2025-01-25"),
        updatedAt: new Date("2025-01-29")
      },
      {
        id: randomUUID(),
        sessionId: demoSessionId,
        status: "processing",
        total: "387.00",
        items: [
          {
            id: randomUUID(),
            sessionId: demoSessionId,
            productId: productIds[1], // Russell Slim Straight
            quantity: 1,
            size: "32",
            color: "Indigo",
            createdAt: new Date("2025-01-28")
          },
          {
            id: randomUUID(),
            sessionId: demoSessionId,
            productId: productIds[2], // Emma Straight
            quantity: 1,
            size: "26",
            color: "Light Wash",
            createdAt: new Date("2025-01-28")
          }
        ],
        shippingAddress: {
          name: "Demo Customer",
          address: "123 Fashion Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          phone: "+1-555-0123"
        },
        paymentMethod: "cod",
        codAmount: "387.00",
        createdAt: new Date("2025-01-28"),
        updatedAt: new Date("2025-01-30")
      }
    ];

    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const item: CartItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date() 
    };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const items = await this.getCartItems(sessionId);
    items.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      startedAt: new Date(),
      endedAt: null,
      rating: null
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      Object.assign(conversation, updates);
      this.conversations.set(id, conversation);
      return conversation;
    }
    return undefined;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);

    // Simulate order progression after creation
    this.simulateOrderProgression(id);

    return order;
  }

  private simulateOrderProgression(orderId: string) {
    // Update to "processing" after 30 seconds
    setTimeout(() => {
      this.updateOrderStatus(orderId, "processing");
    }, 30000);

    // Update to "shipped" after 2 minutes
    setTimeout(() => {
      this.updateOrderStatus(orderId, "shipped");
    }, 120000);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.sessionId === sessionId
    );
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics | undefined> {
    return this.analytics;
  }

  async updateAnalytics(data: Partial<Analytics>): Promise<Analytics> {
    Object.assign(this.analytics, data);
    return this.analytics;
  }
}

export const storage = new MemStorage();
