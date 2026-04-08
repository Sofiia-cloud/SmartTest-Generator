import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import quizService from '../services/quizService';
import QuizModel from '../models/Quiz';
import { ROLES } from 'shared';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Description: Get quiz attempt result by ID
// Endpoint: GET /api/results/:id
// Request: {}
// Response: { result: QuizResult }
router.get('/:id', requireUser([ROLES.STUDENT, ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const attempt = await quizService.getAttemptById(req.params.id);

    if (!attempt) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Check if user is the student who took the quiz or an admin
    if (req.user.role === ROLES.STUDENT && attempt.studentId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch the quiz to get the questions
    const quiz = await QuizModel.findById(attempt.quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.status(200).json({
      result: {
        ...attempt.toObject(),
        questions: quiz.questions,
      },
    });
  } catch (error) {
    console.error(`Error fetching result: ${error}`);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

// Description: Get all results for a student
// Endpoint: GET /api/results
// Request: {}
// Response: { results: QuizAttempt[] }
router.get('/', requireUser([ROLES.STUDENT]), async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await quizService.getStudentAttempts(req.user._id);
    res.status(200).json({ results: attempts });
  } catch (error) {
    console.error(`Error fetching student results: ${error}`);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
