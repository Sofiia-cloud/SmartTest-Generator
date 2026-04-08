export interface QuizQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  documentId: string;
  documentName: string;
  questions: QuizQuestion[];
  settings: {
    numberOfQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    timeLimit?: number;
    passingScore: number;
    category?: string;
  };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  _id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  answers: { [questionId: string]: number };
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
}

export interface QuizResult {
  _id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  answers: { [questionId: string]: number };
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
  questions: QuizQuestion[];
}