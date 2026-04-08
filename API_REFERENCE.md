# DocQuizAI - API Reference

Complete API documentation for all backend endpoints.

---

## Base URL
```
http://localhost:3000
```

---

## Authentication

All endpoints (except login/register) require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 📋 Authentication Endpoints

### Login
**POST** `/api/auth/login`

Login with email and password to receive JWT tokens.

**Request:**
```json
{
  "email": "admin@docquiz.com",
  "password": "Admin@123456"
}
```

**Response (200):**
```json
{
  "_id": "69023902504117addb5bfded",
  "email": "admin@docquiz.com",
  "role": "admin",
  "createdAt": "2024-10-29T15:55:46.801Z",
  "lastLoginAt": "2024-10-29T15:55:46.801Z",
  "isActive": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Register
**POST** `/api/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "_id": "69023902504117addb5bfdef",
  "email": "newuser@example.com",
  "createdAt": "2024-10-29T15:55:46.801Z"
}
```

---

### Get Current User
**GET** `/api/auth/me`

Requires authentication.

**Response (200):**
```json
{
  "_id": "69023902504117addb5bfded",
  "email": "admin@docquiz.com",
  "role": "admin",
  "createdAt": "2024-10-29T15:55:46.801Z",
  "lastLoginAt": "2024-10-29T15:55:46.801Z",
  "isActive": true
}
```

---

## 📄 Document Endpoints

### Upload Document
**POST** `/api/documents/upload`

Upload a PDF document. Automatically extracts text content.

**Auth:** Bearer token + Admin role

**Request:**
- Content-Type: `multipart/form-data`
- Form field: `file` (PDF file)

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@myfile.pdf"
```

**Response (200):**
```json
{
  "document": {
    "_id": "6902393728ab7ffac735f647",
    "fileName": "myfile.pdf",
    "fileSize": 1843200,
    "uploadDate": "2024-10-29T15:56:39.080Z",
    "status": "ready",
    "content": "PDF text content extracted...",
    "userId": "6902393628ab7ffac735f639",
    "quizCount": 0
  }
}
```

---

### Get All Documents
**GET** `/api/documents`

Get all documents uploaded by the current admin user.

**Auth:** Bearer token + Admin role

**Response (200):**
```json
{
  "documents": [
    {
      "_id": "6902393728ab7ffac735f647",
      "fileName": "JavaScript Fundamentals.pdf",
      "fileSize": 1843200,
      "uploadDate": "2024-10-29T15:56:39.080Z",
      "status": "ready",
      "userId": "6902393628ab7ffac735f639",
      "quizCount": 2
    },
    {
      "_id": "6902393728ab7ffac735f649",
      "fileName": "AWS Cloud Practitioner Guide.pdf",
      "fileSize": 2457600,
      "uploadDate": "2024-10-29T15:56:39.080Z",
      "status": "ready",
      "userId": "6902393628ab7ffac735f639",
      "quizCount": 1
    }
  ]
}
```

---

### Get Document by ID
**GET** `/api/documents/:id`

Get specific document details.

**Auth:** Bearer token + Admin role

**Path Parameter:**
- `id`: Document ID

**Response (200):**
```json
{
  "document": {
    "_id": "6902393728ab7ffac735f647",
    "fileName": "JavaScript Fundamentals.pdf",
    "fileSize": 1843200,
    "uploadDate": "2024-10-29T15:56:39.080Z",
    "status": "ready",
    "content": "JavaScript Programming Basics\n\nIntroduction to JavaScript...",
    "userId": "6902393628ab7ffac735f639",
    "quizCount": 0
  }
}
```

---

### Delete Document
**DELETE** `/api/documents/:id`

Delete a document.

**Auth:** Bearer token + Admin role

**Path Parameter:**
- `id`: Document ID

**Response (200):**
```json
{
  "success": true
}
```

---

## 📝 Quiz Endpoints

### Generate Quiz
**POST** `/api/quizzes/generate`

Generate a new quiz from a document using Claude AI.

**Auth:** Bearer token + Admin role

**Request:**
```json
{
  "documentId": "6902393728ab7ffac735f647",
  "title": "JavaScript ES6+ Fundamentals",
  "numberOfQuestions": 10,
  "difficulty": "medium",
  "timeLimit": 30,
  "passingScore": 70,
  "category": "Programming"
}
```

**Response (200):**
```json
{
  "quiz": {
    "_id": "69023937ae9a9ffac735f649",
    "title": "JavaScript ES6+ Fundamentals",
    "documentId": "6902393728ab7ffac735f647",
    "documentName": "JavaScript Fundamentals.pdf",
    "questions": [
      {
        "_id": "q1",
        "questionText": "What is the correct syntax for declaring a variable using const?",
        "options": [
          "const myVar = 5;",
          "variable myVar = 5;",
          "const: myVar = 5;",
          "declare const myVar = 5;"
        ],
        "correctAnswer": 0,
        "explanation": "The correct syntax for const is 'const variableName = value;'",
        "difficulty": "easy"
      }
    ],
    "settings": {
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "timeLimit": 30,
      "passingScore": 70,
      "category": "Programming"
    },
    "status": "draft",
    "createdAt": "2024-10-29T15:56:39.080Z",
    "updatedAt": "2024-10-29T15:56:39.080Z"
  }
}
```

---

### Get All Quizzes (Admin)
**GET** `/api/quizzes`

Get all quizzes created by the current admin user.

**Auth:** Bearer token + Admin role

**Response (200):**
```json
{
  "quizzes": [
    {
      "_id": "69023937ae9a9ffac735f649",
      "title": "JavaScript ES6+ Fundamentals",
      "documentId": "6902393728ab7ffac735f647",
      "documentName": "JavaScript Fundamentals.pdf",
      "questions": [],
      "settings": {
        "numberOfQuestions": 10,
        "difficulty": "medium",
        "timeLimit": 30,
        "passingScore": 70,
        "category": "Programming"
      },
      "status": "published",
      "createdAt": "2024-10-29T15:56:39.080Z",
      "updatedAt": "2024-10-29T15:56:39.080Z"
    }
  ]
}
```

---

### Get Published Quizzes (Students)
**GET** `/api/quizzes/student`

Get all published quizzes available for students.

**Auth:** Bearer token + Student role

**Response (200):**
```json
{
  "quizzes": [
    {
      "_id": "69023937ae9a9ffac735f649",
      "title": "JavaScript ES6+ Fundamentals",
      "description": "Test your knowledge of modern JavaScript",
      "documentId": "6902393728ab7ffac735f647",
      "documentName": "JavaScript Fundamentals.pdf",
      "questions": [],
      "settings": {
        "numberOfQuestions": 10,
        "difficulty": "medium",
        "timeLimit": 30,
        "passingScore": 70,
        "category": "Programming"
      },
      "status": "published",
      "createdAt": "2024-10-29T15:56:39.080Z",
      "updatedAt": "2024-10-29T15:56:39.080Z"
    }
  ]
}
```

---

### Get Quiz by ID
**GET** `/api/quizzes/:id`

Get full quiz details including all questions.

**Auth:** Bearer token (Admin or Student)

**Path Parameter:**
- `id`: Quiz ID

**Response (200):**
```json
{
  "quiz": {
    "_id": "69023937ae9a9ffac735f649",
    "title": "JavaScript ES6+ Fundamentals",
    "documentId": "6902393728ab7ffac735f647",
    "documentName": "JavaScript Fundamentals.pdf",
    "questions": [
      {
        "_id": "q1",
        "questionText": "What is the correct syntax for declaring a variable using const?",
        "options": [
          "const myVar = 5;",
          "variable myVar = 5;",
          "const: myVar = 5;",
          "declare const myVar = 5;"
        ],
        "correctAnswer": 0,
        "explanation": "The correct syntax for const is 'const variableName = value;'",
        "difficulty": "easy"
      },
      {
        "_id": "q2",
        "questionText": "What does the spread operator (...) do in JavaScript?",
        "options": [
          "Multiplies values",
          "Expands iterables into individual elements",
          "Creates a spread of data",
          "Removes elements"
        ],
        "correctAnswer": 1,
        "explanation": "The spread operator expands iterables like arrays and objects into individual elements.",
        "difficulty": "medium"
      }
    ],
    "settings": {
      "numberOfQuestions": 10,
      "difficulty": "medium",
      "timeLimit": 30,
      "passingScore": 70,
      "category": "Programming"
    },
    "status": "published",
    "createdAt": "2024-10-29T15:56:39.080Z",
    "updatedAt": "2024-10-29T15:56:39.080Z"
  }
}
```

---

### Update Quiz
**PUT** `/api/quizzes/:id`

Update quiz details.

**Auth:** Bearer token + Admin role

**Path Parameter:**
- `id`: Quiz ID

**Request (partial update):**
```json
{
  "title": "JavaScript ES6+ - Updated",
  "status": "published",
  "settings": {
    "numberOfQuestions": 15,
    "difficulty": "hard",
    "timeLimit": 45,
    "passingScore": 75
  }
}
```

**Response (200):**
```json
{
  "quiz": {
    "_id": "69023937ae9a9ffac735f649",
    "title": "JavaScript ES6+ - Updated",
    "status": "published",
    "updatedAt": "2024-10-29T16:00:00.000Z"
  }
}
```

---

### Delete Quiz
**DELETE** `/api/quizzes/:id`

Delete a quiz.

**Auth:** Bearer token + Admin role

**Path Parameter:**
- `id`: Quiz ID

**Response (200):**
```json
{
  "success": true
}
```

---

## 🎯 Quiz Attempt Endpoints

### Submit Quiz Attempt
**POST** `/api/quizzes/:id/submit`

Submit a completed quiz attempt and get results.

**Auth:** Bearer token + Student role

**Path Parameter:**
- `id`: Quiz ID

**Request:**
```json
{
  "answers": {
    "q1": 0,
    "q2": 1,
    "q3": 2,
    "q4": 0,
    "q5": 3
  },
  "timeSpent": 1200
}
```

**Response (200):**
```json
{
  "result": {
    "_id": "69023938ae9a9ffac735f651",
    "quizId": "69023937ae9a9ffac735f649",
    "quizTitle": "JavaScript ES6+ Fundamentals",
    "studentId": "6902390328ab7ffac735f640",
    "answers": {
      "q1": 0,
      "q2": 1,
      "q3": 2,
      "q4": 0,
      "q5": 3
    },
    "score": 80,
    "passed": true,
    "completedAt": "2024-10-29T16:05:00.000Z",
    "timeSpent": 1200,
    "questions": [
      {
        "_id": "q1",
        "questionText": "What is the correct syntax for declaring a variable using const?",
        "options": ["const myVar = 5;", "variable myVar = 5;", "const: myVar = 5;", "declare const myVar = 5;"],
        "correctAnswer": 0,
        "explanation": "The correct syntax for const is 'const variableName = value;'",
        "difficulty": "easy"
      }
    ]
  }
}
```

---

### Get All Student Results
**GET** `/api/results`

Get all quiz attempt results for the current student.

**Auth:** Bearer token + Student role

**Response (200):**
```json
{
  "results": [
    {
      "_id": "69023938ae9a9ffac735f651",
      "quizId": "69023937ae9a9ffac735f649",
      "quizTitle": "JavaScript ES6+ Fundamentals",
      "studentId": "6902390328ab7ffac735f640",
      "score": 80,
      "passed": true,
      "completedAt": "2024-10-29T16:05:00.000Z",
      "timeSpent": 1200
    },
    {
      "_id": "69023938ae9a9ffac735f652",
      "quizId": "69023937ae9a9ffac735f650",
      "quizTitle": "AWS Cloud Fundamentals",
      "studentId": "6902390328ab7ffac735f640",
      "score": 65,
      "passed": false,
      "completedAt": "2024-10-29T16:10:00.000Z",
      "timeSpent": 1800
    }
  ]
}
```

---

### Get Quiz Result by ID
**GET** `/api/results/:id`

Get specific quiz result with detailed information.

**Auth:** Bearer token (Student or Admin)

**Path Parameter:**
- `id`: Result ID

**Response (200):**
```json
{
  "result": {
    "_id": "69023938ae9a9ffac735f651",
    "quizId": "69023937ae9a9ffac735f649",
    "quizTitle": "JavaScript ES6+ Fundamentals",
    "studentId": "6902390328ab7ffac735f640",
    "answers": {
      "q1": 0,
      "q2": 1,
      "q3": 2
    },
    "score": 80,
    "passed": true,
    "completedAt": "2024-10-29T16:05:00.000Z",
    "timeSpent": 1200,
    "questions": [
      {
        "_id": "q1",
        "questionText": "What is the correct syntax for declaring a variable using const?",
        "options": ["const myVar = 5;", ...],
        "correctAnswer": 0,
        "explanation": "The correct syntax for const is 'const variableName = value;'",
        "difficulty": "easy"
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Quiz not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate quiz"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Data Types

### Document
```typescript
{
  _id: string,
  fileName: string,
  fileSize: number,
  uploadDate: string (ISO 8601),
  status: "processing" | "ready" | "error",
  content: string,
  userId: string,
  quizCount: number,
  errorMessage?: string
}
```

### Quiz
```typescript
{
  _id: string,
  title: string,
  description?: string,
  documentId: string,
  documentName: string,
  questions: QuizQuestion[],
  settings: {
    numberOfQuestions: number,
    difficulty: "easy" | "medium" | "hard" | "mixed",
    timeLimit?: number,
    passingScore: number,
    category?: string
  },
  status: "draft" | "published",
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601),
  createdBy: string
}
```

### QuizQuestion
```typescript
{
  _id: string,
  questionText: string,
  options: string[],
  correctAnswer: number (0-3),
  explanation: string,
  difficulty: "easy" | "medium" | "hard"
}
```

### QuizAttempt/Result
```typescript
{
  _id: string,
  quizId: string,
  quizTitle: string,
  studentId: string,
  answers: { [questionId: string]: number },
  score: number (0-100),
  passed: boolean,
  completedAt: string (ISO 8601),
  timeSpent: number (seconds),
  questions?: QuizQuestion[]
}
```

---

## Rate Limiting

No rate limiting is currently implemented. For production, consider implementing rate limiting to prevent abuse.

---

## CORS

CORS is enabled for all origins in development. For production, restrict to specific origins:

```javascript
cors({
  origin: 'https://yourdomain.com',
  credentials: true
})
```

---

## Authentication Flow

1. User logs in with email/password: `POST /api/auth/login`
2. Receive `accessToken` and `refreshToken`
3. Include `accessToken` in Authorization header for subsequent requests
4. When token expires, use `refreshToken` to get a new `accessToken`: `POST /api/auth/refresh`

---

## Example Usage with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docquiz.com","password":"Admin@123456"}'
```

### Get Documents
```bash
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer <access_token>"
```

### Upload Document
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@document.pdf"
```

### Generate Quiz
```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId":"6902393728ab7ffac735f647",
    "title":"Test Quiz",
    "numberOfQuestions":10,
    "difficulty":"medium",
    "passingScore":70
  }'
```

---

## Example Usage with JavaScript/Fetch

### Login and Get Documents
```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@docquiz.com',
    password: 'Admin@123456'
  })
});

const { accessToken } = await loginResponse.json();

// Get Documents
const documentsResponse = await fetch('http://localhost:3000/api/documents', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { documents } = await documentsResponse.json();
console.log(documents);
```

---

**Last Updated:** October 29, 2024
