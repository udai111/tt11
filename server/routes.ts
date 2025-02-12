import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Basic health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // User management routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);

      if (existingUser) {
        res.json(existingUser);
      } else {
        const newUser = await storage.createUser(data);
        res.json(newUser);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const username = req.headers["x-username"] as string;
    if (!username) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  // Intraday Pattern Routes
  app.get("/api/patterns/active/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const patterns = await storage.getActivePatterns(symbol);
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching active patterns:', error);
      res.status(500).json({ error: "Failed to fetch active patterns" });
    }
  });

  // Technical Indicators Routes
  app.get("/api/indicators/latest/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const indicators = await storage.getLatestIndicators(symbol);
      res.json(indicators);
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      res.status(500).json({ error: "Failed to fetch technical indicators" });
    }
  });

  // Screener Results Routes
  app.get("/api/screener/latest/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const results = await storage.getLatestScreenerResults(symbol);
      res.json(results);
    } catch (error) {
      console.error('Error fetching screener results:', error);
      res.status(500).json({ error: "Failed to fetch screener results" });
    }
  });

  return createServer(app);
}