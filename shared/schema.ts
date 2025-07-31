import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  gender: text("gender").notNull(),
  image: text("image").notNull(),
  sizes: text("sizes").array().notNull(),
  colors: text("colors").array().notNull(),
  inStock: boolean("in_stock").default(true),
  features: text("features").array().notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  size: text("size").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull(),
  status: text("status").notNull().default("active"),
  customerName: text("customer_name"),
  startedAt: timestamp("started_at").default(sql`now()`),
  endedAt: timestamp("ended_at"),
  rating: integer("rating"),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull().default("cod"),
  codAmount: decimal("cod_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").default(sql`now()`),
  totalConversations: integer("total_conversations").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"),
  avgResponseTime: decimal("avg_response_time", { precision: 5, scale: 2 }).default("0"),
  customerSatisfaction: decimal("customer_satisfaction", { precision: 5, scale: 2 }).default("0"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;
