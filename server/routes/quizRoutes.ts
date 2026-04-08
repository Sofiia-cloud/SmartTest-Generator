import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import quizService from '../services/quizService';
import { ROLES } from 'shared';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Description: Generate a new quiz from a document
// Endpoint: POST /api/quizzes/generate
// Request: { documentId: string, title: string, numberOfQuestions: number, difficulty: string, passingScore: number, ... }
// Response: { quiz: Quiz }
router.post('/generate', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, title, numberOfQuestions, difficulty, timeLimit, passingScore, category } = req.body;

    if (!documentId || !title || !numberOfQuestions || !difficulty || passingScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    console.log(`Admin ${req.user._id} is generating quiz: ${title}`);

    const quiz = await quizService.generateQuiz({
      documentId,
      title,
      numberOfQuestions,
      difficulty,
      timeLimit,
      passingScore,
      category,
      userId: req.user._id,
    });

    res.status(200).json({ quiz });
  } catch (error) {
    console.error(`Error generating quiz: ${error}`);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate quiz' });
  }
});

// Description: Get all quizzes (admin view - only their own)
// Endpoint: GET /api/quizzes
// Request: {}
// Response: { quizzes: Quiz[] }
router.get('/', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await quizService.getAllQuizzes(req.user._id);
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(`Error fetching quizzes: ${error}`);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Description: Get published quizzes for students
// Endpoint: GET /api/quizzes/student
// Request: {}
// Response: { quizzes: Quiz[] }
router.get('/student', requireUser([ROLES.STUDENT]), async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await quizService.getPublishedQuizzes();
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(`Error fetching published quizzes: ${error}`);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Description: Get quiz by ID
// Endpoint: GET /api/quizzes/:id
// Request: {}
// Response: { quiz: Quiz }
router.get('/:id', requireUser([ROLES.ADMIN, ROLES.STUDENT]), async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await quizService.getById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // If student, only allow access to published quizzes
    if (req.user.role === ROLES.STUDENT && quiz.status !== 'published') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If admin, only allow access to their own quizzes
    if (req.user.role === ROLES.ADMIN && quiz.createdBy !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error(`Error fetching quiz: ${error}`);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Description: Update quiz
// Endpoint: PUT /api/quizzes/:id
// Request: { quiz: Partial<Quiz> }
// Response: { quiz: Quiz }
router.put('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await quizService.getById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user owns this quiz
    if (quiz.createdBy !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log(`Updating quiz: ${req.params.id}`);

    const updatedQuiz = await quizService.update(req.params.id, req.body);

    res.status(200).json({ quiz: updatedQuiz });
  } catch (error) {
    console.error(`Error updating quiz: ${error}`);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Description: Delete quiz
// Endpoint: DELETE /api/quizzes/:id
// Request: {}
// Response: { success: boolean }
router.delete('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await quizService.getById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user owns this quiz
    if (quiz.createdBy !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log(`Deleting quiz: ${req.params.id}`);

    await quizService.delete(req.params.id);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error deleting quiz: ${error}`);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Description: Submit quiz attempt
// Endpoint: POST /api/quizzes/:id/submit
// Request: { answers: { [questionId: string]: number }, timeSpent: number }
// Response: { result: QuizResult }
router.post('/:id/submit', requireUser([ROLES.STUDENT]), async (req: AuthRequest, res: Response) => {
  try {
    const { answers, timeSpent } = req.body;

    if (!answers || timeSpent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await quizService.getById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.status !== 'published') {
      return res.status(403).json({ error: 'Quiz is not available' });
    }

    console.log(`Student ${req.user._id} submitted attempt for quiz: ${req.params.id}`);

    const result = await quizService.submitAttempt({
      quizId: req.params.id,
      studentId: req.user._id,
      answers,
      timeSpent,
    });

    // Fetch the quiz to include with result
    const questions = quiz.questions;

    res.status(200).json({ result: { ...result.toObject(), questions } });
  } catch (error) {
    console.error(`Error submitting quiz attempt: ${error}`);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

export default router;
