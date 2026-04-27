import express from "express";
import {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Публичные маршруты
router.post("/register", register);
router.post("/login", login);

// Защищенные маршруты
router.get("/me", authMiddleware, getMe);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
