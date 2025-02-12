import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Create and export the Express app
export const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add base path middleware for Netlify Functions
app.use((req, res, next) => {
  if (process.env.NETLIFY) {
    // Remove the Netlify Functions base path for local routing
    req.originalUrl = req.originalUrl.replace('/.netlify/functions/server', '');
    req.url = req.url.replace('/.netlify/functions/server', '');
  }
  next();
});

// Register API routes
const server = registerRoutes(app);

// Setup server based on environment
if (process.env.NODE_ENV === 'production') {
  log('Running in production mode');
  serveStatic(app);
} else {
  log('Running in development mode');
  setupVite(app, server)
    .catch((err) => {
      console.error('Failed to setup Vite:', err);
      process.exit(1);
    });
}

// Only start the server if we're not in a serverless environment
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT || 5000);
  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running at http://0.0.0.0:${PORT}`);
  });

  // Basic error handling
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
}