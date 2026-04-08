import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => true, // Don't throw on any status code
});

let adminToken = '';
let studentToken = '';
let documentId = '';
let quizId = '';
let attemptId = '';

const log = (message: string, data?: any) => {
  console.log(`\n✓ ${message}`);
  if (data) console.log('  Response:', JSON.stringify(data, null, 2));
};

const logError = (message: string, error: any, status?: number) => {
  console.log(`\n✗ ${message}`);
  if (status) {
    console.log('  Status:', status);
  }
  console.log('  Error:', JSON.stringify(error, null, 2));
};

const testEndpoints = async () => {
  try {
    console.log('\n🧪 Starting API Endpoint Tests...\n');

    // ==================== AUTHENTICATION ====================
    console.log('📋 Testing Authentication Endpoints');

    // Test Admin Login
    let response = await api.post('/api/auth/login', {
      email: 'admin@docquiz.com',
      password: 'Admin@123456',
    });

    if (response.status === 200) {
      adminToken = response.data.accessToken;
      log('Admin Login', { email: 'admin@docquiz.com', hasToken: !!adminToken });
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    } else {
      logError('Admin Login', response.data);
      return;
    }

    // Test Student Login
    response = await api.post('/api/auth/login', {
      email: 'student1@docquiz.com',
      password: 'Student@123456',
    });

    if (response.status === 200) {
      studentToken = response.data.accessToken;
      log('Student Login', { email: 'student1@docquiz.com', hasToken: !!studentToken });
    } else {
      logError('Student Login', response.data);
      return;
    }

    // Get current user
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    response = await api.get('/api/auth/me');
    if (response.status === 200) {
      log('Get Current User (Admin)', { email: response.data.email, role: response.data.role });
    } else {
      logError('Get Current User', response.data, response.status);
    }

    // ==================== DOCUMENTS ====================
    console.log('\n📄 Testing Document Endpoints');

    // Get documents
    response = await api.get('/api/documents');
    if (response.status === 200) {
      log('Get All Documents', { count: response.data.documents?.length });
      if (response.data.documents.length > 0) {
        documentId = response.data.documents[0]._id;
        log('First Document Details', response.data.documents[0]);
      }
    } else {
      logError('Get All Documents', response.data, response.status);
    }

    // Get document by ID (if available)
    if (documentId) {
      response = await api.get(`/api/documents/${documentId}`);
      if (response.status === 200) {
        log('Get Document by ID', { id: response.data.document._id, name: response.data.document.fileName });
      } else {
        logError('Get Document by ID', response.data);
      }
    }

    // ==================== QUIZZES ====================
    console.log('\n📝 Testing Quiz Endpoints');

    // Get admin quizzes
    response = await api.get('/api/quizzes');
    if (response.status === 200) {
      log('Get Admin Quizzes', { count: response.data.quizzes?.length });
      if (response.data.quizzes.length > 0) {
        quizId = response.data.quizzes[0]._id;
        log('First Quiz Details', response.data.quizzes[0]);
      }
    } else {
      logError('Get Admin Quizzes', response.data, response.status);
    }

    // Generate new quiz (if document available)
    if (documentId) {
      console.log('\n  ⏳ Generating quiz with Claude (this may take a moment)...');
      response = await api.post('/api/quizzes/generate', {
        documentId,
        title: 'Test Quiz - AWS Fundamentals',
        numberOfQuestions: 3,
        difficulty: 'easy',
        passingScore: 70,
        timeLimit: 15,
        category: 'Cloud Computing',
      });

      if (response.status === 200) {
        quizId = response.data.quiz._id;
        log('Generated Quiz', {
          id: response.data.quiz._id,
          title: response.data.quiz.title,
          questionsCount: response.data.quiz.questions?.length,
        });
      } else {
        logError('Generate Quiz', response.data);
      }
    }

    // Get quiz by ID (if available)
    if (quizId) {
      response = await api.get(`/api/quizzes/${quizId}`);
      if (response.status === 200) {
        log('Get Quiz by ID', {
          id: response.data.quiz._id,
          title: response.data.quiz.title,
          questionsCount: response.data.quiz.questions?.length,
        });
      } else {
        logError('Get Quiz by ID', response.data);
      }
    }

    // ==================== STUDENT QUIZZES ====================
    console.log('\n👤 Testing Student Quiz Endpoints');

    // Switch to student token
    api.defaults.headers.common['Authorization'] = `Bearer ${studentToken}`;

    // Get available quizzes for students
    response = await api.get('/api/quizzes/student');
    if (response.status === 200) {
      log('Get Available Quizzes (Student)', { count: response.data.quizzes?.length });
    } else {
      logError('Get Available Quizzes (Student)', response.data);
    }

    // ==================== PUBLISH & SUBMIT QUIZ ====================
    if (quizId) {
      console.log('\n🔄 Testing Quiz Publishing and Submission');

      // Switch back to admin to publish the quiz
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

      response = await api.put(`/api/quizzes/${quizId}`, {
        status: 'published',
      });

      if (response.status === 200) {
        log('Publish Quiz', { id: quizId, status: response.data.quiz.status });
      } else {
        logError('Publish Quiz', response.data);
      }

      // Switch to student and submit attempt
      api.defaults.headers.common['Authorization'] = `Bearer ${studentToken}`;

      // Get the quiz to know the question IDs
      const quizResponse = await api.get(`/api/quizzes/${quizId}`);
      if (quizResponse.status === 200) {
        const questions = quizResponse.data.quiz.questions || [];
        const answers: { [key: string]: number } = {};

        // Answer all questions with index 0
        questions.forEach((q: any) => {
          answers[q._id] = 0;
        });

        response = await api.post(`/api/quizzes/${quizId}/submit`, {
          answers,
          timeSpent: 180, // 3 minutes
        });

        if (response.status === 200) {
          attemptId = response.data.result._id;
          log('Submit Quiz Attempt', {
            id: attemptId,
            score: response.data.result.score,
            passed: response.data.result.passed,
          });
        } else {
          logError('Submit Quiz Attempt', response.data);
        }
      }
    }

    // ==================== RESULTS ====================
    console.log('\n🏆 Testing Results Endpoints');

    // Get student results
    response = await api.get('/api/results');
    if (response.status === 200) {
      log('Get Student Results', { count: response.data.results?.length });
    } else {
      logError('Get Student Results', response.data);
    }

    // Get specific result
    if (attemptId) {
      response = await api.get(`/api/results/${attemptId}`);
      if (response.status === 200) {
        log('Get Result by ID', {
          id: response.data.result._id,
          score: response.data.result.score,
          questionsCount: response.data.result.questions?.length,
        });
      } else {
        logError('Get Result by ID', response.data);
      }
    }

    // ==================== UPDATE & DELETE ====================
    if (quizId) {
      console.log('\n✏️ Testing Update and Delete Endpoints');

      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

      // Update quiz
      response = await api.put(`/api/quizzes/${quizId}`, {
        title: 'Updated Quiz Title - AWS Fundamentals',
        description: 'Updated description',
      });

      if (response.status === 200) {
        log('Update Quiz', { id: quizId, newTitle: response.data.quiz.title });
      } else {
        logError('Update Quiz', response.data);
      }
    }

    console.log('\n\n✅ All API endpoint tests completed!');
    console.log('\n📊 Summary:');
    console.log(`  - Admin logged in with token`);
    console.log(`  - Student logged in with token`);
    console.log(`  - Documents retrieved (${documentId ? 'found' : 'not found'})`);
    console.log(`  - Quiz generated with Claude AI (${quizId ? 'created' : 'not created'})`);
    console.log(`  - Quiz published and submitted (${attemptId ? 'submitted' : 'not submitted'})`);
    console.log(`  - Results retrieved (${attemptId ? 'success' : 'not tested'})`);

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

// Wait for server to be ready
setTimeout(testEndpoints, 2000);
