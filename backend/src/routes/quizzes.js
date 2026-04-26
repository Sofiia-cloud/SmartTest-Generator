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

const router = express.Router();

router.use(authMiddleware);

router.get("/", getQuizzes);
router.get("/attempts", getAttempts);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);

// Admin only
router.post("/generate", roleMiddleware(["admin"]), generateQuiz);
router.put("/:id/publish", roleMiddleware(["admin"]), publishQuiz);

export default router;
