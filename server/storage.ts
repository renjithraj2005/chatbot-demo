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
      // WOMEN'S PRODUCTS
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
      },

      // MEN'S PRODUCTS
      {
        id: randomUUID(),
        name: "Avery Embroidered Camp Shirt",
        description: "Linen camp shirt with embroidered details. Relaxed fit with modern styling and premium linen construction for summer comfort.",
        price: "306.00",
        category: "shirts",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBW25PA021LIML-963-A/Avery-Embroidered-Camp-Shirt-963?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White Remi Stripe", "Gull Remi Stripe"],
        inStock: true,
        features: ["Linen construction", "Embroidered details", "Camp shirt style", "Relaxed fit"],
        rating: "4.7",
        reviewCount: 156
      },
      {
        id: randomUUID(),
        name: "Miramar Fit 4 Pants",
        description: "Cotton terry with Miramar printing technique. Straight-leg fit with revolutionary denim-like appearance and superior comfort.",
        price: "271.00",
        category: "pants",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBW25P7013TRML-963-A/Miramar-Fit-4-Pants-963?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36", "38"],
        colors: ["Abington", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Terry", "Fit 4 straight", "Revolutionary printing"],
        rating: "4.6",
        reviewCount: 203
      },
      {
        id: randomUUID(),
        name: "Harvey Striped Knit Polo Shirt",
        description: "Striped knit polo with Harvey collection styling. Premium construction with vintage-inspired stitch and breathable yarn.",
        price: "329.00",
        category: "polos",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBS25P033BC33-402-A/Harvey-Striped-Knit-Polo-Shirt-402?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Moonlight Grape", "Navy White", "Black White"],
        inStock: true,
        features: ["Harvey Collection", "Striped design", "Knit construction", "Vintage-inspired"],
        rating: "4.8",
        reviewCount: 178
      },
      {
        id: randomUUID(),
        name: "Haydon Linen Shorts",
        description: "Premium linen shorts with modern tailoring. Comfortable fit with sophisticated styling for warm weather occasions.",
        price: "271.00",
        category: "shorts",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBW25P9005LIML-030-A/Haydon-Linen-Shorts-030?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36"],
        colors: ["Chime Grey", "Berry Black", "Natural"],
        inStock: true,
        features: ["Premium linen", "Modern tailoring", "Comfortable fit", "Sophisticated styling"],
        rating: "4.5",
        reviewCount: 134
      },
      {
        id: randomUUID(),
        name: "Fit 2 Slim Jeans",
        description: "Aero Stretch denim in light blue wash. Slim fit through hip and thigh with modern construction and superior comfort.",
        price: "226.00",
        category: "jeans",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MED25P1223AEIB-471-A/Fit-2-Slim-Jeans-471?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36", "38"],
        colors: ["Light Blue", "Dark Blue", "Black"],
        inStock: true,
        features: ["Aero Stretch", "Slim fit", "Modern construction", "Superior comfort"],
        rating: "4.7",
        reviewCount: 245
      },
      {
        id: randomUUID(),
        name: "Avery Zuma Knit Shirt",
        description: "Terry toweling knit shirt from Zuma collection. Contemporary styling with premium construction and modern comfort.",
        price: "317.00",
        category: "shirts",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBS25P020NC20-022-A/Avery-Zuma-Knit-Shirt-022?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Leaf Grey", "Moonlight", "Black"],
        inStock: true,
        features: ["Terry Toweling", "Zuma Collection", "Contemporary styling", "Premium construction"],
        rating: "4.6",
        reviewCount: 167
      },
      {
        id: randomUUID(),
        name: "Sour Face Embroidered Tee",
        description: "Classic flame tee with Sour Face embroidery. Archive icon with new expression and contemporary styling.",
        price: "135.00",
        category: "tshirts",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/RF4625FT2GM-100-A/Sour-Face-Embroidered-Tee-100?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Arctic", "Black", "Grape", "Leaf Grey", "Light Blue", "Moonlight"],
        inStock: true,
        features: ["Classic Flame", "Sour Face embroidery", "Archive icon", "Contemporary styling"],
        rating: "4.8",
        reviewCount: 298
      },
      {
        id: randomUUID(),
        name: "Fit 3 Athletic Fit Jean",
        description: "Authentic stretch denim with athletic fit. Designed for movement with modern construction and comfortable stretch.",
        price: "257.00",
        category: "jeans",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MED23S1215FFGO-416-A/Fit-3-Athletic-Fit-Jean-416?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36", "38"],
        colors: ["Gordon", "Black", "Indigo"],
        inStock: true,
        features: ["Authentic Stretch", "Athletic fit", "Designed for movement", "Modern construction"],
        rating: "4.5",
        reviewCount: 189
      },
      {
        id: randomUUID(),
        name: "rb Suede Trucker Jacket",
        description: "Premium suede trucker jacket with modern construction. Classic silhouette with contemporary styling and luxury materials.",
        price: "1024.00",
        category: "jackets",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBW25P2015LTML-001-A/rb-Suede-Trucker-Jacket-001?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Brown"],
        inStock: true,
        features: ["Premium suede", "Trucker style", "Modern construction", "Luxury materials"],
        rating: "4.9",
        reviewCount: 87
      },
      {
        id: randomUUID(),
        name: "rbBAGGY Fit Jeans",
        description: "Authentic rigid denim in white wash. Relaxed baggy fit with contemporary styling and premium construction.",
        price: "271.00",
        category: "jeans",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MED25P1255RGWH-100-A/rbBAGGY-Fit-Jeans-100?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36"],
        colors: ["White", "Black", "Indigo"],
        inStock: true,
        features: ["Authentic Rigid", "rbBAGGY fit", "Contemporary styling", "Premium construction"],
        rating: "4.6",
        reviewCount: 156
      },
      {
        id: randomUUID(),
        name: "Zuma Zip Knit Polo Shirt",
        description: "Terry toweling polo with zip detail. Modern construction with Zuma collection styling and premium comfort.",
        price: "374.00",
        category: "polos",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBS25P032YF32-001-A/Zuma-Zip-Knit-Polo-Shirt-001?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Navy", "White"],
        inStock: true,
        features: ["Terry Toweling", "Zip detail", "Zuma Collection", "Premium comfort"],
        rating: "4.7",
        reviewCount: 134
      },
      {
        id: randomUUID(),
        name: "Butler Linen Blazer",
        description: "Premium linen blazer with sophisticated tailoring. Modern fit with luxury construction for formal occasions.",
        price: "647.00",
        category: "blazers",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBW25P4007LIML-033-A/Butler-Linen-Blazer-033?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Pavement", "Black", "Navy"],
        inStock: true,
        features: ["Premium linen", "Sophisticated tailoring", "Modern fit", "Luxury construction"],
        rating: "4.8",
        reviewCount: 98
      },

      // MORE WOMEN'S PRODUCTS
      {
        id: randomUUID(),
        name: "Nina High-Rise Ankle Skinny Jeans",
        description: "Featherweight denim with high-rise fit. Ankle-length skinny jeans with ultra-lightweight comfort and modern styling.",
        price: "313.00",
        category: "jeans",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WDD25P1004RGBS-471-A/Nina-High-Rise-Ankle-Skinny-Jeans-471?$medium$&fmt=auto",
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31"],
        colors: ["Bleach Stripe", "Black", "Indigo"],
        inStock: true,
        features: ["Featherweight Technology", "High-rise fit", "Ankle length", "Ultra-lightweight"],
        rating: "4.7",
        reviewCount: 234
      },
      {
        id: randomUUID(),
        name: "Cate Mid-Rise Ankle Skinny Jeans",
        description: "Featherweight denim in Seneca wash. Mid-rise ankle skinny with revolutionary lightweight technology and perfect fit.",
        price: "313.00",
        category: "jeans",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WDD25P1002RGBS-436-A/Cate-Mid-Rise-Ankle-Skinny-Jeans-436?$medium$&fmt=auto",
        sizes: ["24", "25", "26", "27", "28", "29", "30"],
        colors: ["Seneca", "Black", "Blue"],
        inStock: true,
        features: ["Featherweight Technology", "Mid-rise fit", "Ankle skinny", "Perfect fit"],
        rating: "4.6",
        reviewCount: 189
      },
      {
        id: randomUUID(),
        name: "The Slub Long-Sleeve Tee",
        description: "Slub cotton long-sleeve tee with relaxed fit. Premium construction with modern styling and everyday comfort.",
        price: "113.00",
        category: "tshirts",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WCC22HT012NM12-944-A/The-Slub-Long-Sleeve-Tee-944?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Sunlight Khaki", "Military Olive", "Salute"],
        inStock: true,
        features: ["Slub cotton", "Long-sleeve", "Relaxed fit", "Premium construction"],
        rating: "4.5",
        reviewCount: 167
      },
      {
        id: randomUUID(),
        name: "Miramar Cropped Wide-Leg Pants",
        description: "Cotton terry with Miramar printing in cropped wide-leg silhouette. Revolutionary denim-like appearance with modern comfort.",
        price: "189.00",
        category: "pants",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/RC1325F7MTE-421-A/Miramar-Cropped-Wide-Leg-Pants-421?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Lenox Petra Scarlet", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Terry", "Cropped wide-leg", "Revolutionary printing"],
        rating: "4.8",
        reviewCount: 203
      },
      {
        id: randomUUID(),
        name: "Dre Low-Rise Boyfriend Jeans",
        description: "Authentic stretch denim with low-rise boyfriend fit. Relaxed styling with modern construction and comfortable wear.",
        price: "265.00",
        category: "jeans",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WDD25P1012ASGG-126-A/Dre-Low-Rise-Boyfriend-Jeans-126?$medium$&fmt=auto",
        sizes: ["24", "25", "26", "27", "28", "29", "30"],
        colors: ["Glacier", "Black", "Indigo"],
        inStock: true,
        features: ["Authentic Stretch", "Low-rise fit", "Boyfriend style", "Comfortable wear"],
        rating: "4.6",
        reviewCount: 178
      },
      {
        id: randomUUID(),
        name: "Miramar Sweatshirt",
        description: "Cotton terry sweatshirt with Miramar printing technique. Comfortable fit with revolutionary denim-like appearance.",
        price: "189.00",
        category: "sweaters",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/RC1325F5MTE-421-A/Miramar-Sweatshirt-421?$medium$&fmt=auto",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Lenox Petra Scarlet", "Black", "Navy"],
        inStock: true,
        features: ["Miramar Technology", "Cotton Terry", "Comfortable fit", "Revolutionary printing"],
        rating: "4.7",
        reviewCount: 145
      },
      {
        id: randomUUID(),
        name: "Fit 2 Slim Chinos",
        description: "Stretch cotton twill chinos with slim fit. Modern construction with versatile styling for casual and formal occasions.",
        price: "261.00",
        category: "pants",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/RX1225S7WCH-421-A/Fit-2-Slim-Chinos-421?$medium$&fmt=auto",
        sizes: ["30", "31", "32", "33", "34", "36"],
        colors: ["Sky Blue", "Khaki", "Leaf Grey", "Natural Grey", "Salute"],
        inStock: true,
        features: ["Stretch Cotton Twill", "Slim fit", "Modern construction", "Versatile styling"],
        rating: "4.5",
        reviewCount: 167
      },
      {
        id: randomUUID(),
        name: "Sanford Knit Tank Top",
        description: "Premium knit tank top with modern construction. Comfortable fit with sophisticated styling for layering or standalone wear.",
        price: "261.00",
        category: "tshirts",
        gender: "men",
        image: "https://cdn.media.amplience.net/i/rb/MBS25P029UC29-001-A/Sanford-Knit-Tank-Top-001?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "White", "Navy"],
        inStock: true,
        features: ["Premium knit", "Modern construction", "Comfortable fit", "Sophisticated styling"],
        rating: "4.4",
        reviewCount: 123
      },

      // Handbags
      {
        id: randomUUID(),
        name: "Passenger Crossbody Bag",
        description: "Structured crossbody bag with modern design. Premium leather construction with adjustable strap and contemporary styling.",
        price: "395.00",
        category: "handbags",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAC25PA0014000-001-A/Passenger-Crossbody-Bag-001?$medium$&fmt=auto",
        sizes: ["One Size"],
        colors: ["Black", "Brown", "Navy"],
        inStock: true,
        rating: "4.8",
        reviewCount: 124,
        features: ["Premium leather", "Adjustable strap", "Multiple compartments"]
      },
      {
        id: randomUUID(),
        name: "Pilot Tote Bag",
        description: "Spacious tote bag with sophisticated design. Premium construction with modern styling and versatile functionality.",
        price: "495.00",
        category: "handbags",
        gender: "women",
        image: "https://cdn.media.amplience.net/i/rb/WAC25PA0012000-001-A/Pilot-Tote-Bag-001?$medium$&fmt=auto",
        sizes: ["One Size"],
        colors: ["Black", "Cognac", "Navy"],
        inStock: true,
        rating: "4.7",
        reviewCount: 98,
        features: ["Spacious interior", "Premium leather", "Modern design"]
      },

      // Accessories
      {
        id: randomUUID(),
        name: "Classic Leather Belt",
        description: "Premium leather belt with modern buckle design. Sophisticated styling with versatile functionality for any occasion.",
        price: "195.00",
        category: "accessories",
        gender: "unisex",
        image: "https://cdn.media.amplience.net/i/rb/RAC25PA0001000-001-A/Classic-Leather-Belt-001?$medium$&fmt=auto",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Brown", "Cognac"],
        inStock: true,
        rating: "4.5",
        reviewCount: 156,
        features: ["Premium leather", "Modern buckle", "Versatile styling"]
      },
      {
        id: randomUUID(),
        name: "Aviator Sunglasses",
        description: "Classic aviator sunglasses with modern lens technology. Premium construction with UV protection and contemporary styling.",
        price: "245.00",
        category: "accessories",
        gender: "unisex",
        image: "https://cdn.media.amplience.net/i/rb/RAC25PA0003000-001-A/Aviator-Sunglasses-001?$medium$&fmt=auto",
        sizes: ["One Size"],
        colors: ["Black", "Gold", "Silver"],
        inStock: true,
        rating: "4.6",
        reviewCount: 87,
        features: ["UV protection", "Premium lenses", "Classic design"]
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
