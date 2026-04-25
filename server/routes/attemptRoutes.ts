import express, { Request, Response } from "express";
import { requireAuth } from "./middlewares/auth";
import { AppDataSource } from "../config/data-source";
import { QuizAttempt } from "../models/QuizAttempt.entity";
import { Quiz } from "../models/Quiz.entity";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get quiz attempt result by ID
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const attemptRepo = AppDataSource.getRepository(QuizAttempt);
    const attempt = await attemptRepo.findOne({
      where: { id: req.params.id },
      relations: ["quiz"],
    });

    if (!attempt) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Check if user is the student who took the quiz or an admin
    if (req.user!.role !== "admin" && attempt.studentId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch the quiz to get the questions
    const quizRepo = AppDataSource.getRepository(Quiz);
    const quiz = await quizRepo.findOne({
      where: { id: attempt.quizId },
      relations: ["questions", "questions.options"],
    });

    res.status(200).json({
      result: {
        id: attempt.id,
        score: attempt.score,
        passed: attempt.passed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        quizId: attempt.quizId,
        questions: quiz?.questions || [],
      },
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

// Get all results for a student
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can access their results" });
    }

    const attemptRepo = AppDataSource.getRepository(QuizAttempt);
    const attempts = await attemptRepo.find({
      where: { studentId: req.user.id },
      relations: ["quiz"],
      order: { startedAt: "DESC" },
    });

    res.status(200).json({ results: attempts });
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

export default router;
