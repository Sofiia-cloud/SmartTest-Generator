import QuizModel, { IQuiz, IQuizQuestion } from '../models/Quiz';
import QuizAttemptModel, { IQuizAttempt } from '../models/QuizAttempt';
import DocumentModel from '../models/Document';
import { generateQuizWithClaude } from './anthropicService';
import documentService from './documentService';

class QuizService {
  /**
   * Generate a new quiz from a document
   */
  async generateQuiz(data: {
    documentId: string;
    title: string;
    numberOfQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    timeLimit?: number;
    passingScore: number;
    category?: string;
    userId: string;
  }): Promise<IQuiz> {
    try {
      console.log(`Generating quiz: ${data.title} for document: ${data.documentId}`);

      // Fetch document
      const document = await DocumentModel.findById(data.documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (!document.content) {
        throw new Error('Document content is not available');
      }

      // Generate questions using Claude
      const generatedQuiz = await generateQuizWithClaude({
        content: document.content,
        numberOfQuestions: data.numberOfQuestions,
        difficulty: data.difficulty,
        category: data.category,
      });

      // Create quiz in database
      const quiz = new QuizModel({
        title: data.title,
        documentId: data.documentId,
        documentName: document.fileName,
        questions: generatedQuiz.questions,
        settings: {
          numberOfQuestions: data.numberOfQuestions,
          difficulty: data.difficulty,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          category: data.category,
        },
        status: 'draft',
        createdBy: data.userId,
      });

      const savedQuiz = await quiz.save();
      console.log(`Quiz created successfully: ${savedQuiz._id}`);

      // Update document quiz count
      await documentService.updateQuizCount(data.documentId, 1);

      return savedQuiz;
    } catch (error) {
      console.error(`Error generating quiz: ${error}`);
      throw error;
    }
  }

  /**
   * Get all quizzes (admin view)
   */
  async getAllQuizzes(userId?: string): Promise<IQuiz[]> {
    try {
      const query = userId ? { createdBy: userId } : {};
      const quizzes = await QuizModel.find(query).sort({ createdAt: -1 });
      return quizzes;
    } catch (error) {
      console.error(`Error fetching all quizzes: ${error}`);
      throw error;
    }
  }

  /**
   * Get published quizzes for students
   */
  async getPublishedQuizzes(): Promise<IQuiz[]> {
    try {
      const quizzes = await QuizModel.find({ status: 'published' }).sort({ createdAt: -1 });
      return quizzes;
    } catch (error) {
      console.error(`Error fetching published quizzes: ${error}`);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   */
  async getById(quizId: string): Promise<IQuiz | null> {
    try {
      const quiz = await QuizModel.findById(quizId);
      return quiz;
    } catch (error) {
      console.error(`Error fetching quiz by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update quiz
   */
  async update(quizId: string, data: Partial<IQuiz>): Promise<IQuiz | null> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };

      const quiz = await QuizModel.findByIdAndUpdate(quizId, updateData, { new: true });
      return quiz;
    } catch (error) {
      console.error(`Error updating quiz: ${error}`);
      throw error;
    }
  }

  /**
   * Delete quiz
   */
  async delete(quizId: string): Promise<boolean> {
    try {
      // Get quiz to find document ID
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Delete the quiz
      await QuizModel.findByIdAndDelete(quizId);
      console.log(`Quiz deleted: ${quizId}`);

      // Update document quiz count
      await documentService.updateQuizCount(quiz.documentId, -1);

      return true;
    } catch (error) {
      console.error(`Error deleting quiz: ${error}`);
      throw error;
    }
  }

  /**
   * Submit quiz attempt and calculate score
   */
  async submitAttempt(data: {
    quizId: string;
    studentId: string;
    answers: { [questionId: string]: number };
    timeSpent: number;
  }): Promise<IQuizAttempt> {
    try {
      console.log(`Submitting quiz attempt for quiz: ${data.quizId}, student: ${data.studentId}`);

      // Fetch quiz
      const quiz = await QuizModel.findById(data.quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Calculate score
      let correctCount = 0;
      for (const question of quiz.questions) {
        const studentAnswer = data.answers[question._id];
        if (studentAnswer === question.correctAnswer) {
          correctCount++;
        }
      }

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.settings.passingScore;

      // Create attempt record
      const attempt = new QuizAttemptModel({
        quizId: data.quizId,
        quizTitle: quiz.title,
        studentId: data.studentId,
        answers: data.answers,
        score,
        passed,
        timeSpent: data.timeSpent,
      });

      const savedAttempt = await attempt.save();
      console.log(`Quiz attempt saved: ${savedAttempt._id}, score: ${score}`);

      return savedAttempt;
    } catch (error) {
      console.error(`Error submitting quiz attempt: ${error}`);
      throw error;
    }
  }

  /**
   * Get quiz attempt by ID
   */
  async getAttemptById(attemptId: string): Promise<IQuizAttempt | null> {
    try {
      const attempt = await QuizAttemptModel.findById(attemptId);
      return attempt;
    } catch (error) {
      console.error(`Error fetching quiz attempt: ${error}`);
      throw error;
    }
  }

  /**
   * Get student's attempts for a quiz
   */
  async getStudentAttempts(studentId: string): Promise<IQuizAttempt[]> {
    try {
      const attempts = await QuizAttemptModel.find({ studentId }).sort({ completedAt: -1 });
      return attempts;
    } catch (error) {
      console.error(`Error fetching student attempts: ${error}`);
      throw error;
    }
  }

  /**
   * Get attempts for a specific quiz
   */
  async getQuizAttempts(quizId: string): Promise<IQuizAttempt[]> {
    try {
      const attempts = await QuizAttemptModel.find({ quizId }).sort({ completedAt: -1 });
      return attempts;
    } catch (error) {
      console.error(`Error fetching quiz attempts: ${error}`);
      throw error;
    }
  }
}

export default new QuizService();
