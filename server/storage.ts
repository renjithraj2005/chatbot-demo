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
  }

  private initializeProducts() {
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Florence Skinny - Dark Wash",
        description: "Mid-rise skinny with sustainable stretch denim. Crafted with our proprietary performance fabric blend for all-day comfort and eco-conscious design.",
        price: "179.00",
        category: "jeans",
        gender: "women",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31"],
        colors: ["Dark Wash", "Medium Wash", "Light Wash"],
        inStock: true,
        features: ["89% less water used in production", "Instasculpt™ technology", "Sustainable cotton blend", "Machine washable"],
        rating: "4.8",
        reviewCount: 124
      },
      {
        id: randomUUID(),
        name: "Russell Slim Straight - Indigo",
        description: "Comfortably lean through hip & thigh, tapered towards ankle. Made with DL Ultimate™ technology using less than 10 gallons of water per jean.",
        price: "208.00",
        category: "jeans",
        gender: "men",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["30", "31", "32", "33", "34", "36", "38"],
        colors: ["Indigo", "Dark Blue", "Black"],
        inStock: true,
        features: ["DL Ultimate™ technology", "High-retention stretch", "Water-efficient production", "Laser finishing"],
        rating: "4.7",
        reviewCount: 89
      },
      {
        id: randomUUID(),
        name: "Classic Denim Jacket",
        description: "Timeless design with sustainable cotton. The perfect layering piece crafted from our signature eco-friendly denim.",
        price: "248.00",
        category: "jackets",
        gender: "unisex",
        image: "https://pixabay.com/get/g29d69293ec1bb5cc590e95fc32c0f5a9d8b29f6d1a197f3bde2ce6a1fc3c8a5f860251968c919e435ad23ded5c6da9f2facbb63dcc4deae93c3ee5e47067691c_1280.jpg",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Classic Blue", "Black", "White"],
        inStock: true,
        features: ["Sustainable cotton", "Classic fit", "Versatile styling", "Quality construction"],
        rating: "4.9",
        reviewCount: 156
      },
      {
        id: randomUUID(),
        name: "Emma Straight - Light Wash",
        description: "High-rise straight leg with vintage-inspired wash. Perfect balance of comfort and style with sustainable materials.",
        price: "188.00",
        category: "jeans",
        gender: "women",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["24", "25", "26", "27", "28", "29", "30"],
        colors: ["Light Wash", "Medium Wash", "White"],
        inStock: true,
        features: ["High-rise fit", "Vintage wash", "Sustainable materials", "Comfortable stretch"],
        rating: "4.6",
        reviewCount: 92
      },
      {
        id: randomUUID(),
        name: "Brady Slim - Black",
        description: "Slim fit that runs lean from hip to hem. Made with DL Ultimate™ technology for superior comfort and shape retention.",
        price: "199.00",
        category: "jeans",
        gender: "men",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["30", "31", "32", "33", "34", "36"],
        colors: ["Black", "Dark Grey", "Navy"],
        inStock: true,
        features: ["Slim fit design", "DL Ultimate™ fabric", "Shape retention technology", "Waterless finishing"],
        rating: "4.5",
        reviewCount: 76
      },
      {
        id: randomUUID(),
        name: "Chloe Skinny - Medium Wash",
        description: "Kids' signature skinny jean that runs slim from hip to ankle. Soft, flexible fit with fibers requiring 50% less dye, water, and energy.",
        price: "69.00",
        category: "jeans",
        gender: "kids",
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["4", "6", "8", "10", "12", "14"],
        colors: ["Medium Wash", "Light Wash", "Dark Wash"],
        inStock: true,
        features: ["Skinny fit design", "50% less water usage", "Comfortable stretch", "Five-pocket styling"],
        rating: "4.7",
        reviewCount: 143
      },
      {
        id: randomUUID(),
        name: "Emma Low Rise Skinny - Light Wash",
        description: "Low-rise skinny jean that slenderizes, sculpts and holds at every angle. Clean, minimalist silhouette with sustainable stretch.",
        price: "179.00",
        category: "jeans",
        gender: "women",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31"],
        colors: ["Light Wash", "Medium Wash", "Dark Wash"],
        inStock: true,
        features: ["Low-rise fit", "Instasculpt™ technology", "Sustainable stretch denim", "Clean silhouette"],
        rating: "4.6",
        reviewCount: 98
      },
      {
        id: randomUUID(),
        name: "Nick Slim - Dark Blue",
        description: "Streamlined straight leg with slim fit. Made with DL Ultimate™ fabric for exceptional comfort and durability.",
        price: "189.00",
        category: "jeans",
        gender: "men",
        image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["28", "29", "30", "31", "32", "33", "34", "36"],
        colors: ["Dark Blue", "Black", "Indigo"],
        inStock: true,
        features: ["Slim fit design", "DL Ultimate™ fabric", "Waterless technology", "High-retention stretch"],
        rating: "4.4",
        reviewCount: 67
      },
      {
        id: randomUUID(),
        name: "Classic Denim Jacket - Indigo",
        description: "Timeless denim jacket crafted from signature eco-friendly denim. Perfect layering piece for any season.",
        price: "248.00",
        category: "jackets",
        gender: "unisex",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Indigo", "Black", "Light Wash"],
        inStock: true,
        features: ["Classic fit", "Sustainable denim", "Versatile styling", "Premium construction"],
        rating: "4.9",
        reviewCount: 156
      },
      {
        id: randomUUID(),
        name: "Hawke Skinny - Navy",
        description: "Boys' skinny jean with comfortable fit and durable construction. Made with the same sustainable practices as adult line.",
        price: "59.00",
        category: "jeans",
        gender: "kids",
        image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200",
        sizes: ["4", "6", "8", "10", "12", "14", "16", "18"],
        colors: ["Navy", "Black", "Indigo"],
        inStock: true,
        features: ["Skinny fit", "Sustainable materials", "Comfortable stretch", "Durable construction"],
        rating: "4.5",
        reviewCount: 89
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
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
    return order;
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
