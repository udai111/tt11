import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
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

  const httpServer = createServer(app);
  return httpServer;
}
