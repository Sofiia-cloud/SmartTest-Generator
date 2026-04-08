import api from './api';
import { Student, StudentProfile } from '@/types/student';

// Description: Get all students
// Endpoint: GET /api/students
// Request: {}
// Response: { students: Student[] }
export const getStudents = async () => {
  // Mocking the response
  return new Promise<{ students: Student[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        students: [
          {
            _id: '1',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            registrationDate: '2024-01-10T08:00:00Z',
            quizzesTaken: 5,
            averageScore: 82,
            isActive: true,
          },
          {
            _id: '2',
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            registrationDate: '2024-01-12T10:30:00Z',
            quizzesTaken: 3,
            averageScore: 91,
            isActive: true,
          },
          {
            _id: '3',
            fullName: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            registrationDate: '2024-01-15T14:20:00Z',
            quizzesTaken: 7,
            averageScore: 76,
            isActive: true,
          },
        ],
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/students');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get student profile
// Endpoint: GET /api/student/profile
// Request: {}
// Response: { profile: StudentProfile }
export const getStudentProfile = async () => {
  // Mocking the response
  return new Promise<{ profile: StudentProfile }>((resolve) => {
    setTimeout(() => {
      resolve({
        profile: {
          _id: '1',
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          registrationDate: '2024-01-10T08:00:00Z',
          quizHistory: [
            {
              quizId: '1',
              quizTitle: 'AWS Cloud Practitioner Certification',
              score: 85,
              passed: true,
              completedAt: '2024-01-16T10:30:00Z',
            },
            {
              quizId: '2',
              quizTitle: 'JavaScript ES6+ Features',
              score: 78,
              passed: true,
              completedAt: '2024-01-21T14:20:00Z',
            },
          ],
          certificates: [
            {
              certificateId: 'cert1',
              quizTitle: 'AWS Cloud Practitioner Certification',
              score: 85,
              completedAt: '2024-01-16T10:30:00Z',
            },
          ],
        },
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/student/profile');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update student profile
// Endpoint: PUT /api/student/profile
// Request: { fullName?: string }
// Response: { profile: StudentProfile }
export const updateStudentProfile = async (data: { fullName?: string }) => {
  // Mocking the response
  return new Promise<{ profile: StudentProfile }>((resolve) => {
    setTimeout(() => {
      resolve({
        profile: {
          _id: '1',
          fullName: data.fullName || 'John Doe',
          email: 'john.doe@example.com',
          registrationDate: '2024-01-10T08:00:00Z',
          quizHistory: [],
          certificates: [],
        },
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put('/api/student/profile', data);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Deactivate student
// Endpoint: PUT /api/students/:id/deactivate
// Request: {}
// Response: { success: boolean }
export const deactivateStudent = async (studentId: string) => {
  // Mocking the response
  return new Promise<{ success: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/students/${studentId}/deactivate`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};