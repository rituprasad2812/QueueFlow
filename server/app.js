const express = require("express");
const cors = require("cors");
const { CLIENT_URL } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");
const businessRoutes = require("./routes/businessRoutes");
const counterRoutes = require("./routes/counterRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/tokens", tokenRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "QueueFlow API is running 🚀" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR CAUGHT:", err.message);
  console.log("STACK:", err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;