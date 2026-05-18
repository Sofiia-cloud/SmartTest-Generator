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
import { auditLog } from "../middleware/auditLog.js"; // 👈 импортируем логирование

const router = express.Router();

// ========== ПУБЛИЧНЫЕ МАРШРУТЫ (без authMiddleware) ==========

// Регистрация
router.post(
  "/register",
  auditLog("REGISTRATION", async (req) => {
    return `Email: ${req.body.email}, role: ${req.body.role || "student"}`;
  }),
  register,
);

// Вход в систему
router.post(
  "/login",
  auditLog("LOGIN", async (req) => {
    return `Email: ${req.body.email}`;
  }),
  login,
);

// ========== ЗАЩИЩЁННЫЕ МАРШРУТЫ (с authMiddleware) ==========

// Получение своего профиля
router.get("/me", authMiddleware, getMe);

// Получение профиля (детальный)
router.get("/profile", authMiddleware, getProfile);

// Обновление профиля
router.put(
  "/profile",
  authMiddleware,
  auditLog("UPDATE_PROFILE", async (req) => {
    return `Пользователь ${req.user.email} обновил имя/фамилию`;
  }),
  updateProfile,
);

// Смена пароля
router.put(
  "/change-password",
  authMiddleware,
  auditLog("CHANGE_PASSWORD", async (req) => {
    return `Пользователь ${req.user.email} сменил пароль`;
  }),
  changePassword,
);

export default router;
