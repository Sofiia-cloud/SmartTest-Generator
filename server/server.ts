import dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import express from "express";
import cors from "cors";
import session from "express-session";
import { AppDataSource } from "./config/data-source";

// Import routes
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import quizRoutes from "./routes/quizRoutes";
import attemptRoutes from "./routes/attemptRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", attemptRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "SmartTest API is running!" });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("✅ PostgreSQL connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
