import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  cash_balance: decimal("cash_balance").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  current_price: decimal("current_price").notNull(),
  last_updated: timestamp("last_updated").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  portfolio_id: integer("portfolio_id").references(() => portfolios.id),
  stock_id: integer("stock_id").references(() => stocks.id),
  type: text("type").notNull(), // 'buy' or 'sell'
  quantity: integer("quantity").notNull(),
  price: decimal("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const educational_resources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty_level: text("difficulty_level").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const social_interactions = pgTable("social_interactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'comment', 'follow', 'like'
  target_id: integer("target_id").notNull(), // can be user_id or post_id
  content: text("content"),
  created_at: timestamp("created_at").defaultNow(),
});

export const intraday_patterns = pgTable("intraday_patterns", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  pattern_type: text("pattern_type").notNull(),
  timeframe: text("timeframe").notNull(),
  probability: decimal("probability").notNull(),
  signal_time: timestamp("signal_time").defaultNow(),
  is_active: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

export const technical_indicators = pgTable("technical_indicators", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  indicator_type: text("indicator_type").notNull(),
  value: decimal("value").notNull(),
  timeframe: text("timeframe").notNull(),
  calculation_time: timestamp("calculation_time").defaultNow(),
  metadata: jsonb("metadata"),
});

export const screener_results = pgTable("screener_results", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  screening_type: text("screening_type").notNull(),
  probability_score: decimal("probability_score").notNull(),
  signal_strength: decimal("signal_strength").notNull(),
  trigger_price: decimal("trigger_price").notNull(),
  target_price: decimal("target_price"),
  stop_loss: decimal("stop_loss"),
  timeframe: text("timeframe").notNull(),
  scan_time: timestamp("scan_time").defaultNow(),
  metadata: jsonb("metadata"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  created_at: true 
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  created_at: true
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  last_updated: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true
});

export const insertEducationalResourceSchema = createInsertSchema(educational_resources).omit({
  id: true,
  created_at: true
});

export const insertSocialInteractionSchema = createInsertSchema(social_interactions).omit({
  id: true,
  created_at: true
});

export const insertIntradayPatternSchema = createInsertSchema(intraday_patterns).omit({
  id: true,
  created_at: true,
});

export const insertTechnicalIndicatorSchema = createInsertSchema(technical_indicators).omit({
  id: true,
});

export const insertScreenerResultSchema = createInsertSchema(screener_results).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertEducationalResource = z.infer<typeof insertEducationalResourceSchema>;
export type EducationalResource = typeof educational_resources.$inferSelect;

export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;
export type SocialInteraction = typeof social_interactions.$inferSelect;

export type InsertIntradayPattern = z.infer<typeof insertIntradayPatternSchema>;
export type IntradayPattern = typeof intraday_patterns.$inferSelect;

export type InsertTechnicalIndicator = z.infer<typeof insertTechnicalIndicatorSchema>;
export type TechnicalIndicator = typeof technical_indicators.$inferSelect;

export type InsertScreenerResult = z.infer<typeof insertScreenerResultSchema>;
export type ScreenerResult = typeof screener_results.$inferSelect;