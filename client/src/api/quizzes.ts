import api from './api';
import { Quiz, QuizQuestion, QuizAttempt, QuizResult } from '@/types/quiz';

// Description: Get all quizzes (admin)
// Endpoint: GET /api/quizzes
// Request: {}
// Response: { quizzes: Quiz[] }
export const getQuizzes = async () => {
  try {
    const response = await api.get('/api/quizzes');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Generate quiz from document
// Endpoint: POST /api/quizzes/generate
// Request: { documentId: string, title: string, numberOfQuestions: number, difficulty: string, passingScore: number, ... }
// Response: { quiz: Quiz }
export const generateQuiz = async (data: {
  documentId: string;
  title: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit?: number;
  passingScore: number;
  category?: string;
}) => {
  try {
    const response = await api.post('/api/quizzes/generate', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Get quiz by ID
// Endpoint: GET /api/quizzes/:id
// Request: {}
// Response: { quiz: Quiz }
export const getQuizById = async (quizId: string) => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Update quiz
// Endpoint: PUT /api/quizzes/:id
// Request: { ...Partial<Quiz> }
// Response: { quiz: Quiz }
export const updateQuiz = async (quizId: string, data: Partial<Quiz>) => {
  try {
    const response = await api.put(`/api/quizzes/${quizId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Delete quiz
// Endpoint: DELETE /api/quizzes/:id
// Request: {}
// Response: { success: boolean }
export const deleteQuiz = async (quizId: string) => {
  try {
    const response = await api.delete(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Submit quiz attempt
// Endpoint: POST /api/quizzes/:id/submit
// Request: { answers: { [questionId: string]: number }, timeSpent: number }
// Response: { result: QuizResult }
export const submitQuizAttempt = async (quizId: string, answers: { [questionId: string]: number }, timeSpent: number) => {
  try {
    const response = await api.post(`/api/quizzes/${quizId}/submit`, { answers, timeSpent });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Get available quizzes for students
// Endpoint: GET /api/quizzes/student
// Request: {}
// Response: { quizzes: Quiz[] }
export const getAvailableQuizzes = async () => {
  try {
    const response = await api.get('/api/quizzes/student');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Get quiz result by ID
// Endpoint: GET /api/results/:id
// Request: {}
// Response: { result: QuizResult }
export const getQuizResult = async (resultId: string) => {
  try {
    const response = await api.get(`/api/results/${resultId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Get all quiz attempts for the current student
// Endpoint: GET /api/results
// Request: {}
// Response: { results: QuizAttempt[] }
export const getQuizHistory = async () => {
  try {
    const response = await api.get('/api/results');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};