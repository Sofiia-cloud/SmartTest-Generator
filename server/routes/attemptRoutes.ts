import express, { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { QuizAttempt } from "../models/QuizAttempt.entity";
import { Quiz } from "../models/Quiz.entity";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware для получения пользователя из токена
const getUserFromToken = async (
  req: Request,
): Promise<{ id: string; role: string } | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as any;
    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    return null;
  }
};

// Get quiz attempt result by ID
// GET /api/results/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const attemptRepo = AppDataSource.getRepository(QuizAttempt);
    const attempt = await attemptRepo.findOne({
      where: { id: req.params.id },
      relations: ["quiz"],
    });

    if (!attempt) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Check if user is the student who took the quiz or an admin
    if (user.role !== "admin" && attempt.studentId !== user.id) {
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
// GET /api/results
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can access their results" });
    }

    const attemptRepo = AppDataSource.getRepository(QuizAttempt);
    const attempts = await attemptRepo.find({
      where: { studentId: user.id },
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
