import express from "express";
import {
  generateQuiz,
  getQuizzes,
  getQuizById,
  publishQuiz,
  submitQuiz,
  getAttempts,
} from "../controllers/quizController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js"; // 👈 импортируем логирование

const router = express.Router();

router.use(authMiddleware);

// ========== ОБЩИЕ МАРШРУТЫ (для всех авторизованных) ==========

// Получение списка тестов
router.get(
  "/",
  auditLog("GET_QUIZZES", async (req) => {
    return `Пользователь ${req.user.email} запросил список тестов`;
  }),
  getQuizzes,
);

// Получение истории попыток
router.get(
  "/attempts",
  auditLog("GET_ATTEMPTS", async (req) => {
    return `Пользователь ${req.user.email} запросил свою историю прохождений`;
  }),
  getAttempts,
);

// Получение теста по ID
router.get(
  "/:id",
  auditLog("GET_QUIZ_BY_ID", async (req) => {
    return `Пользователь ${req.user.email} запросил тест id=${req.params.id}`;
  }),
  getQuizById,
);

// Отправка ответов (прохождение теста)
router.post(
  "/:id/submit",
  auditLog("SUBMIT_QUIZ", async (req) => {
    const answerCount = Object.keys(req.body.answers || {}).length;
    return `Пользователь ${req.user.email} прошёл тест id=${req.params.id}, ответов: ${answerCount}`;
  }),
  submitQuiz,
);

// ========== АДМИН-МАРШРУТЫ (только для администратора) ==========

// Генерация теста через ИИ
router.post(
  "/generate",
  roleMiddleware(["admin"]),
  auditLog("GENERATE_QUIZ", async (req) => {
    return `Админ ${req.user.email} сгенерировал тест "${req.body.title}" (документ id=${req.body.documentId}, вопросов: ${req.body.questionCount})`;
  }),
  generateQuiz,
);

// Публикация теста
router.put(
  "/:id/publish",
  roleMiddleware(["admin"]),
  auditLog("PUBLISH_QUIZ", async (req) => {
    return `Админ ${req.user.email} опубликовал тест id=${req.params.id}`;
  }),
  publishQuiz,
);

export default router;
