const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware — disable CSP so Vite/React inline scripts work
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, standard script tags)
      if (!origin) return callback(null, true);
      
      // Allow if origin is in CLIENT_URL env var
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow the same domain it's hosted on (for Railway static assets)
      // Since frontend and backend are served together, origin will match the host.
      return callback(null, true); // Permissive for now, to ensure static assets load.
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/team", teamRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to check filesystem on Railway
app.get("/api/debug", (_req, res) => {
  try {
    const clientDistPath = path.join(__dirname, "../client/dist");
    const exists = fs.existsSync(clientDistPath);
    const files = exists ? fs.readdirSync(clientDistPath) : [];
    const assets = exists && fs.existsSync(path.join(clientDistPath, "assets")) 
      ? fs.readdirSync(path.join(clientDistPath, "assets")) 
      : [];
    res.json({ 
      __dirname, 
      clientDistPath, 
      exists, 
      files,
      assets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend — always serve if dist folder exists (works on Railway without NODE_ENV)
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
