import { AppDataSource } from "../config/data-source";
import { Quiz } from "../models/Quiz.entity";
import { Question } from "../models/Question.entity";
import { AnswerOption } from "../models/AnswerOption.entity";
import { QuizAttempt } from "../models/QuizAttempt.entity";
import { Document } from "../models/Document.entity";
import { generateQuestionsFromText } from "./yandexGptService";

const quizRepository = AppDataSource.getRepository(Quiz);
const questionRepository = AppDataSource.getRepository(Question);
const optionRepository = AppDataSource.getRepository(AnswerOption);
const attemptRepository = AppDataSource.getRepository(QuizAttempt);
const documentRepository = AppDataSource.getRepository(Document);

class QuizService {
  /**
   * Generate a new quiz from a document
   */
  async generateQuiz(data: {
    documentId: string;
    title: string;
    numberOfQuestions: number;
    difficulty: "easy" | "medium" | "hard" | "mixed";
    timeLimit?: number;
    passingScore: number;
    category?: string;
    userId: string;
  }): Promise<Quiz> {
    try {
      console.log(
        `Generating quiz: ${data.title} for document: ${data.documentId}`,
      );

      // Fetch document
      const document = await documentRepository.findOne({
        where: { id: data.documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      if (!document.extractedText) {
        throw new Error("Document content is not available");
      }

      // Generate questions using YandexGPT
      const generatedQuiz = await generateQuestionsFromText({
        content: document.extractedText,
        numberOfQuestions: data.numberOfQuestions,
        difficulty: data.difficulty,
        category: data.category,
      });

      // Create quiz in database
      const quiz = new Quiz();
      quiz.title = data.title;
      quiz.documentId = data.documentId;
      quiz.createdBy = data.userId;
      quiz.difficulty = data.difficulty;
      quiz.timeLimit = data.timeLimit;
      quiz.passingScore = data.passingScore;
      quiz.isPublished = false;
      quiz.createdAt = new Date();

      const savedQuiz = await quizRepository.save(quiz);
      console.log(`Quiz created successfully: ${savedQuiz.id}`);

      // Create questions and answer options
      for (let i = 0; i < generatedQuiz.questions.length; i++) {
        const q = generatedQuiz.questions[i];

        const question = new Question();
        question.text = q.questionText;
        question.quizId = savedQuiz.id;
        question.type = "multiple_choice";
        question.points = 1;

        const savedQuestion = await questionRepository.save(question);

        // Create answer options
        for (let j = 0; j < q.options.length; j++) {
          const option = new AnswerOption();
          option.text = q.options[j];
          option.questionId = savedQuestion.id;
          option.isCorrect = j === q.correctAnswer;

          await optionRepository.save(option);
        }
      }

      // Update document quiz count
      document.quizzes = document.quizzes || [];
      // TypeORM will handle the relation automatically
      await documentRepository.save(document);

      // Return quiz with relations
      return (await quizRepository.findOne({
        where: { id: savedQuiz.id },
        relations: ["questions", "questions.options"],
      })) as Quiz;
    } catch (error) {
      console.error(`Error generating quiz: ${error}`);
      throw error;
    }
  }

  /**
   * Get all quizzes (admin view)
   */
  async getAllQuizzes(userId?: string): Promise<Quiz[]> {
    try {
      const where = userId ? { createdBy: userId } : {};
      const quizzes = await quizRepository.find({
        where,
        relations: ["document"],
        order: { createdAt: "DESC" },
      });
      return quizzes;
    } catch (error) {
      console.error(`Error fetching all quizzes: ${error}`);
      throw error;
    }
  }

  /**
   * Get published quizzes for students
   */
  async getPublishedQuizzes(): Promise<Quiz[]> {
    try {
      const quizzes = await quizRepository.find({
        where: { isPublished: true },
        relations: ["document"],
        order: { createdAt: "DESC" },
      });
      return quizzes;
    } catch (error) {
      console.error(`Error fetching published quizzes: ${error}`);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   */
  async getById(quizId: string): Promise<Quiz | null> {
    try {
      const quiz = await quizRepository.findOne({
        where: { id: quizId },
        relations: ["questions", "questions.options", "document"],
      });
      return quiz;
    } catch (error) {
      console.error(`Error fetching quiz by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update quiz
   */
  async update(quizId: string, data: Partial<Quiz>): Promise<Quiz | null> {
    try {
      await quizRepository.update(quizId, data);
      return await this.getById(quizId);
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
      const quiz = await quizRepository.findOne({
        where: { id: quizId },
        relations: ["document"],
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Delete the quiz (cascade will delete questions and options)
      await quizRepository.delete(quizId);
      console.log(`Quiz deleted: ${quizId}`);

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
  }): Promise<QuizAttempt> {
    try {
      console.log(
        `Submitting quiz attempt for quiz: ${data.quizId}, student: ${data.studentId}`,
      );

      // Fetch quiz with questions and options
      const quiz = await quizRepository.findOne({
        where: { id: data.quizId },
        relations: ["questions", "questions.options"],
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const question of quiz.questions) {
        totalPoints += question.points;
        const userAnswer = data.answers[question.id];

        if (userAnswer !== undefined) {
          const correctOption = question.options.find((opt) => opt.isCorrect);
          if (correctOption && userAnswer === parseInt(correctOption.id)) {
            earnedPoints += question.points;
          }
        }
      }

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= (quiz.passingScore || 60);

      // Create attempt record
      const attempt = new QuizAttempt();
      attempt.quizId = data.quizId;
      attempt.studentId = data.studentId;
      attempt.answers = data.answers;
      attempt.score = score;
      attempt.passed = passed;
      attempt.completedAt = new Date();
      attempt.startedAt = new Date();

      const savedAttempt = await attemptRepository.save(attempt);
      console.log(`Quiz attempt saved: ${savedAttempt.id}, score: ${score}`);

      return savedAttempt;
    } catch (error) {
      console.error(`Error submitting quiz attempt: ${error}`);
      throw error;
    }
  }

  /**
   * Get quiz attempt by ID
   */
  async getAttemptById(attemptId: string): Promise<QuizAttempt | null> {
    try {
      const attempt = await attemptRepository.findOne({
        where: { id: attemptId },
        relations: ["quiz"],
      });
      return attempt;
    } catch (error) {
      console.error(`Error fetching quiz attempt: ${error}`);
      throw error;
    }
  }

  /**
   * Get student's attempts for a quiz
   */
  async getStudentAttempts(studentId: string): Promise<QuizAttempt[]> {
    try {
      const attempts = await attemptRepository.find({
        where: { studentId },
        relations: ["quiz"],
        order: { completedAt: "DESC" },
      });
      return attempts;
    } catch (error) {
      console.error(`Error fetching student attempts: ${error}`);
      throw error;
    }
  }

  /**
   * Get attempts for a specific quiz
   */
  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    try {
      const attempts = await attemptRepository.find({
        where: { quizId },
        relations: ["student"],
        order: { completedAt: "DESC" },
      });
      return attempts;
    } catch (error) {
      console.error(`Error fetching quiz attempts: ${error}`);
      throw error;
    }
  }
}

export default new QuizService();
