import api from './api';

export interface DashboardStats {
  totalDocuments: number;
  totalQuizzes: number;
  totalStudents: number;
  recentActivity: {
    id: string;
    type: 'document' | 'quiz' | 'student';
    message: string;
    timestamp: string;
  }[];
}

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { stats: DashboardStats }
export const getDashboardStats = async () => {
  // Mocking the response
  return new Promise<{ stats: DashboardStats }>((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalDocuments: 12,
          totalQuizzes: 25,
          totalStudents: 48,
          recentActivity: [
            {
              id: '1',
              type: 'student',
              message: 'John Doe completed AWS Cloud Practitioner Certification with 85%',
              timestamp: '2024-01-22T10:30:00Z',
            },
            {
              id: '2',
              type: 'quiz',
              message: 'New quiz "React Best Practices" was published',
              timestamp: '2024-01-22T09:15:00Z',
            },
            {
              id: '3',
              type: 'document',
              message: 'Document "Python Advanced Topics.pdf" was uploaded',
              timestamp: '2024-01-21T16:45:00Z',
            },
            {
              id: '4',
              type: 'student',
              message: 'Jane Smith registered as a new student',
              timestamp: '2024-01-21T14:20:00Z',
            },
          ],
        },
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/dashboard/stats');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};