import { 
  users, portfolios, stocks, transactions, educational_resources, social_interactions,
  intraday_patterns, technical_indicators, screener_results,
  type User, type InsertUser,
  type Portfolio, type InsertPortfolio,
  type Stock, type InsertStock,
  type Transaction, type InsertTransaction,
  type EducationalResource, type InsertEducationalResource,
  type SocialInteraction, type InsertSocialInteraction,
  type IntradayPattern, type InsertIntradayPattern,
  type TechnicalIndicator, type InsertTechnicalIndicator,
  type ScreenerResult, type InsertScreenerResult
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio operations
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getUserPortfolios(userId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;

  // Stock operations
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStockPrice(id: number, price: number): Promise<Stock>;

  // Intraday Pattern operations
  getIntradayPattern(id: number): Promise<IntradayPattern | undefined>;
  getActivePatterns(symbol: string): Promise<IntradayPattern[]>;
  createIntradayPattern(pattern: InsertIntradayPattern): Promise<IntradayPattern>;

  // Technical Indicator operations
  getTechnicalIndicator(id: number): Promise<TechnicalIndicator | undefined>;
  getLatestIndicators(symbol: string): Promise<TechnicalIndicator[]>;
  createTechnicalIndicator(indicator: InsertTechnicalIndicator): Promise<TechnicalIndicator>;

  // Screener Result operations
  getScreenerResult(id: number): Promise<ScreenerResult | undefined>;
  getLatestScreenerResults(symbol: string): Promise<ScreenerResult[]>;
  createScreenerResult(result: InsertScreenerResult): Promise<ScreenerResult>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Portfolio operations
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    try {
      const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
      return portfolio;
    } catch (error) {
      console.error('Error in getPortfolio:', error);
      throw error;
    }
  }

  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    try {
      return await db.select().from(portfolios).where(eq(portfolios.user_id, userId));
    } catch (error) {
      console.error('Error in getUserPortfolios:', error);
      throw error;
    }
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    try {
      const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
      return newPortfolio;
    } catch (error) {
      console.error('Error in createPortfolio:', error);
      throw error;
    }
  }

  // Stock operations
  async getStock(id: number): Promise<Stock | undefined> {
    try {
      const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
      return stock;
    } catch (error) {
      console.error('Error in getStock:', error);
      throw error;
    }
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    try {
      const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
      return stock;
    } catch (error) {
      console.error('Error in getStockBySymbol:', error);
      throw error;
    }
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    try {
      const [newStock] = await db.insert(stocks).values(stock).returning();
      return newStock;
    } catch (error) {
      console.error('Error in createStock:', error);
      throw error;
    }
  }

  async updateStockPrice(id: number, price: number): Promise<Stock> {
    try {
      const [updatedStock] = await db
        .update(stocks)
        .set({ 
          current_price: price.toString(),
          last_updated: new Date() 
        })
        .where(eq(stocks.id, id))
        .returning();
      return updatedStock;
    } catch (error) {
      console.error('Error in updateStockPrice:', error);
      throw error;
    }
  }

  // Intraday Pattern methods
  async getIntradayPattern(id: number): Promise<IntradayPattern | undefined> {
    try {
      const [pattern] = await db.select().from(intraday_patterns).where(eq(intraday_patterns.id, id));
      return pattern;
    } catch (error) {
      console.error('Error in getIntradayPattern:', error);
      throw error;
    }
  }

  async getActivePatterns(symbol: string): Promise<IntradayPattern[]> {
    try {
      return await db
        .select()
        .from(intraday_patterns)
        .where(and(
          eq(intraday_patterns.symbol, symbol),
          eq(intraday_patterns.is_active, true)
        ))
        .orderBy(desc(intraday_patterns.signal_time));
    } catch (error) {
      console.error('Error in getActivePatterns:', error);
      throw error;
    }
  }

  async createIntradayPattern(pattern: InsertIntradayPattern): Promise<IntradayPattern> {
    try {
      const [newPattern] = await db.insert(intraday_patterns).values(pattern).returning();
      return newPattern;
    } catch (error) {
      console.error('Error in createIntradayPattern:', error);
      throw error;
    }
  }

  // Technical Indicator methods
  async getTechnicalIndicator(id: number): Promise<TechnicalIndicator | undefined> {
    try {
      const [indicator] = await db.select().from(technical_indicators).where(eq(technical_indicators.id, id));
      return indicator;
    } catch (error) {
      console.error('Error in getTechnicalIndicator:', error);
      throw error;
    }
  }

  async getLatestIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    try {
      return await db
        .select()
        .from(technical_indicators)
        .where(eq(technical_indicators.symbol, symbol))
        .orderBy(desc(technical_indicators.calculation_time));
    } catch (error) {
      console.error('Error in getLatestIndicators:', error);
      throw error;
    }
  }

  async createTechnicalIndicator(indicator: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    try {
      const [newIndicator] = await db.insert(technical_indicators).values(indicator).returning();
      return newIndicator;
    } catch (error) {
      console.error('Error in createTechnicalIndicator:', error);
      throw error;
    }
  }

  // Screener Result methods
  async getScreenerResult(id: number): Promise<ScreenerResult | undefined> {
    try {
      const [result] = await db.select().from(screener_results).where(eq(screener_results.id, id));
      return result;
    } catch (error) {
      console.error('Error in getScreenerResult:', error);
      throw error;
    }
  }

  async getLatestScreenerResults(symbol: string): Promise<ScreenerResult[]> {
    try {
      return await db
        .select()
        .from(screener_results)
        .where(eq(screener_results.symbol, symbol))
        .orderBy(desc(screener_results.scan_time));
    } catch (error) {
      console.error('Error in getLatestScreenerResults:', error);
      throw error;
    }
  }

  async createScreenerResult(result: InsertScreenerResult): Promise<ScreenerResult> {
    try {
      const [newResult] = await db.insert(screener_results).values(result).returning();
      return newResult;
    } catch (error) {
      console.error('Error in createScreenerResult:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();