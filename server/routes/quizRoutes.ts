import express, { Request, Response } from "express";
import { requireAuth } from "./middlewares/auth";
import { AppDataSource } from "../config/data-source";
import { Quiz } from "../models/Quiz.entity";
import { QuizAttempt } from "../models/QuizAttempt.entity";
import { Question } from "../models/Question.entity";
import { AnswerOption } from "../models/AnswerOption.entity";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get all quizzes (admin view)
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const quizRepo = AppDataSource.getRepository(Quiz);
    const quizzes = await quizRepo.find({
      where: { createdBy: req.user.id },
      relations: ["document"],
      order: { createdAt: "DESC" },
    });
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get published quizzes for students
router.get("/student", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can access this endpoint" });
    }

    const quizRepo = AppDataSource.getRepository(Quiz);
    const quizzes = await quizRepo.find({
      where: { isPublished: true },
      relations: ["document"],
      order: { createdAt: "DESC" },
    });
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching published quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get quiz by ID
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const quizRepo = AppDataSource.getRepository(Quiz);
    const quiz = await quizRepo.findOne({
      where: { id: req.params.id },
      relations: ["questions", "questions.options", "document"],
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // If student, only allow access to published quizzes
    if (req.user!.role === "student" && !quiz.isPublished) {
      return res.status(403).json({ error: "Quiz not available" });
    }

    // If admin, only allow access to their own quizzes
    if (req.user!.role === "admin" && quiz.createdBy !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Submit quiz attempt
router.post(
  "/:id/submit",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== "student") {
        return res
          .status(403)
          .json({ error: "Only students can submit quiz attempts" });
      }

      const { answers, timeSpent } = req.body;
      const quizId = req.params.id;

      if (!answers || timeSpent === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const quizRepo = AppDataSource.getRepository(Quiz);
      const quiz = await quizRepo.findOne({
        where: { id: quizId },
        relations: ["questions", "questions.options"],
      });

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      if (!quiz.isPublished) {
        return res.status(403).json({ error: "Quiz is not available" });
      }

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const question of quiz.questions) {
        totalPoints += question.points;
        const userAnswer = answers[question.id];

        if (userAnswer !== undefined) {
          const correctOption = question.options.find((opt) => opt.isCorrect);
          if (correctOption && userAnswer === correctOption.id) {
            earnedPoints += question.points;
          }
        }
      }

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= (quiz.passingScore || 60);

      // Save attempt
      const attemptRepo = AppDataSource.getRepository(QuizAttempt);
      const attempt = new QuizAttempt();
      attempt.quizId = quizId;
      attempt.studentId = req.user.id;
      attempt.score = score;
      attempt.passed = passed;
      attempt.completedAt = new Date();
      attempt.startedAt = new Date();
      attempt.answers = answers;

      await attemptRepo.save(attempt);

      res.status(200).json({
        result: {
          id: attempt.id,
          score: attempt.score,
          passed: attempt.passed,
          completedAt: attempt.completedAt,
          totalPoints,
          earnedPoints,
          questions: quiz.questions,
        },
      });
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      res.status(500).json({ error: "Failed to submit quiz attempt" });
    }
  },
);

export default router;
