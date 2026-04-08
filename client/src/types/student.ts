export interface Student {
  _id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  quizzesTaken: number;
  averageScore: number;
  isActive: boolean;
}

export interface StudentProfile {
  _id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  quizHistory: {
    quizId: string;
    quizTitle: string;
    score: number;
    passed: boolean;
    completedAt: string;
  }[];
  certificates: {
    certificateId: string;
    quizTitle: string;
    score: number;
    completedAt: string;
  }[];
}