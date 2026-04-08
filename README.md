# DocQuizAI

A comprehensive AI-powered document management and quiz generation platform built with React, Express, MongoDB, and Anthropic Claude AI. Transform your documents into interactive quizzes with automatic question generation and instant feedback.

## Overview

DocQuizAI is an intelligent application that allows administrators to upload PDF documents and automatically generate quizzes using AI. Students can take these quizzes, receive instant feedback, and track their learning progress. The platform uses Claude AI for intelligent quiz generation and provides a seamless learning experience.

## Key Features

- **📄 Document Management**: Upload and manage PDF documents with automatic content extraction
- **🤖 AI-Powered Quiz Generation**: Automatically generate quiz questions using Anthropic Claude AI
- **✅ Interactive Quizzes**: Take quizzes with multiple-choice questions, difficulty levels, and time limits
- **📊 Progress Tracking**: View quiz history, performance statistics, and certificates for passing scores
- **👥 Role-Based Access**: Separate interfaces for administrators and students
- **🔐 Secure Authentication**: JWT-based authentication with password hashing
- **📱 Responsive Design**: Beautiful, modern UI with dark mode support using Tailwind CSS
- **🎯 Quiz Customization**: Set difficulty levels, number of questions, time limits, and passing scores

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Anthropic Claude API** - AI quiz generation
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **pdf-parse** - PDF text extraction

### Infrastructure
- **Docker** - Containerization (optional)
- **Concurrently** - Run multiple npm scripts simultaneously

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud hosting
- **Git** - [Download](https://git-scm.com/)
- **Anthropic API Key** - [Sign up](https://console.anthropic.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/DocQuizAI.git
cd DocQuizAI
```

### 2. Install Dependencies

The project uses a monorepo structure with three packages: `shared`, `client`, and `server`. Install all dependencies with:

```bash
npm install
```

This command will:
- Install root dependencies
- Install client dependencies
- Install server dependencies
- Build the shared package

### 3. Environment Configuration

#### Backend Configuration

Create a `.env` file in the `server` directory with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URL=mongodb://localhost:27017/docquizai

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Session Secret
SESSION_SECRET=your_session_secret_change_this_in_production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important Environment Variables:**
- `ANTHROPIC_API_KEY`: Required for AI quiz generation. Get it from [Anthropic Console](https://console.anthropic.com/)
- `MONGODB_URL`: Local MongoDB or cloud MongoDB Atlas connection string
- `JWT_SECRET`: Change this to a strong, random string in production
- `SESSION_SECRET`: Change this to a strong, random string in production

#### Frontend Configuration

Create a `.env` file in the `client` directory (optional, already configured):

```bash
VITE_API_URL=http://localhost:3000/api
```

### 4. MongoDB Setup

#### Option A: Local MongoDB

If you have MongoDB installed locally:

```bash
# Start MongoDB server (Linux/Mac)
mongod

# Start MongoDB server (Windows)
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

The application will automatically connect to `mongodb://localhost:27017/docquizai`.

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/docquizai`)
4. Update `MONGODB_URL` in your `server/.env` file

## Running the Application

### Development Mode

Run the entire application (client and server simultaneously):

```bash
npm start
```

This command starts:
- **Frontend**: Available at `http://localhost:5173/`
- **Backend**: Available at `http://localhost:3000/`

### Running Individual Components

#### Start Only the Frontend

```bash
npm run client
```

Frontend will be available at `http://localhost:5173/`

#### Start Only the Backend

```bash
npm run server
```

Backend will be available at `http://localhost:3000/`

#### Watch and Build Shared Package

```bash
npm run shared-dev
```

### Production Build

```bash
npm run build
```

This compiles:
- TypeScript to JavaScript
- Vite bundle for frontend
- Builds the shared package

## Database Initialization

### Seed Database with Sample Data

Populate your database with an admin user, student users, and sample documents:

```bash
cd server
npm run seed
```

**Default Test Credentials:**
- **Admin User**
  - Email: `admin@docquizai.com`
  - Password: `admin123`

- **Student User**
  - Email: `student@docquizai.com`
  - Password: `student123`

### Test API Endpoints

To test all API endpoints:

```bash
cd server
npm run test:endpoints
```

This script tests:
- User authentication (login, register)
- Document management
- Quiz generation and retrieval
- Student quiz attempts and results

## API Documentation

Complete API documentation is available in [API_REFERENCE.md](./API_REFERENCE.md)

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

#### Documents
- `GET /api/documents` - List user's documents
- `POST /api/documents` - Upload new document
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

#### Quizzes
- `POST /api/quizzes/generate` - Generate quiz from document
- `GET /api/quizzes` - List all quizzes (admin) or published quizzes (student)
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id` - Update quiz (admin only)
- `DELETE /api/quizzes/:id` - Delete quiz (admin only)

#### Quiz Attempts
- `POST /api/attempts` - Submit quiz attempt
- `GET /api/attempts/:id` - Get attempt result
- `GET /api/attempts` - Get student's quiz history

## Project Structure

```
DocQuizAI/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── pages/                   # Page components (Home, Login, etc.)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/              # Admin-specific components
│   │   │   ├── student/            # Student-specific components
│   │   │   └── ui/                 # Shadcn UI components
│   │   ├── api/                     # API client modules
│   │   ├── contexts/                # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── lib/                     # Utility functions
│   │   ├── App.tsx                  # Root component with routing
│   │   └── main.tsx                 # Application entry point
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── package.json
│
├── server/                          # Express backend application
│   ├── src/ or root level files
│   │   ├── routes/                  # API route handlers
│   │   │   ├── authRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   ├── quizRoutes.ts
│   │   │   └── attemptRoutes.ts
│   │   ├── models/                  # MongoDB Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Document.ts
│   │   │   ├── Quiz.ts
│   │   │   └── QuizAttempt.ts
│   │   ├── services/                # Business logic services
│   │   │   ├── userService.ts
│   │   │   ├── documentService.ts
│   │   │   ├── quizService.ts
│   │   │   ├── anthropicService.ts  # AI integration
│   │   │   └── pdfParseService.ts
│   │   ├── config/                  # Configuration files
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── utils/                   # Utility functions
│   │   ├── scripts/                 # Utility scripts
│   │   │   ├── seed.ts             # Database seeding
│   │   │   └── test-endpoints.ts   # API testing
│   │   └── server.ts               # Express server entry point
│   ├── .env                        # Environment variables (create this)
│   └── package.json
│
├── shared/                          # Shared TypeScript utilities
│   ├── config/
│   │   └── roles.ts                # User role definitions
│   ├── types/
│   │   └── user.ts                 # Shared user types
│   └── package.json
│
├── README.md                        # This file
├── LICENSE                          # MIT License
├── package.json                     # Root package configuration
└── .gitignore                      # Git ignore rules
```

## Development Guide

### Running with Hot Reload

Both frontend and backend support hot reload during development:

```bash
npm start
```

- **Frontend**: Changes to React components automatically refresh in the browser
- **Backend**: Changes to server code automatically restart the server using `tsx watch`

### Code Quality

#### Linting

Run ESLint across the project:

```bash
npm run lint
```

Lint specific packages:

```bash
cd client && npm run lint
cd server && npm run lint
cd shared && npm run lint
```

### Debug Mode

Start the backend with Node.js debugger:

```bash
npm run debug
```

Then open Chrome DevTools and navigate to `chrome://inspect` to debug.

## User Roles

### Administrator
- Upload and manage PDF documents
- Generate quizzes using AI
- Edit quiz questions and settings
- View analytics and student progress
- Configure platform settings

### Student
- View available quizzes
- Take quizzes with timer and navigation
- View quiz results and feedback
- Track learning progress
- Download certificates for passing scores
- View quiz history

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt (10 salt rounds)
3. JWT access token issued (24-hour expiration)
4. Refresh token stored in httpOnly cookie (30-day expiration)
5. Frontend stores access token in localStorage
6. API requests include Authorization header with token
7. On token expiration, client uses refresh token to get new access token

## Common Issues & Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod` command
- Check `MONGODB_URL` in `.env` file
- Verify MongoDB is accessible at that URL
- Try using MongoDB Atlas cloud version

### Anthropic API Key Error
- Verify `ANTHROPIC_API_KEY` is set correctly in `.env`
- Check your API key at [Anthropic Console](https://console.anthropic.com/)
- Ensure your account has API credits

### Port Already in Use
- Frontend on port 5173: `lsof -i :5173` then `kill -9 <PID>`
- Backend on port 3000: `lsof -i :3000` then `kill -9 <PID>`
- Or modify ports in `server/.env` and `client/vite.config.ts`

### CORS Errors
- Ensure `CORS_ORIGIN` in `server/.env` matches your frontend URL
- Check that both are using the same protocol (http/https)

### TypeScript Build Errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Rebuild shared package: `npm run shared-build`
- Clear TypeScript cache

## Performance Optimization

### Frontend Optimization
- Code splitting with React Router lazy loading
- Image optimization with Vite
- CSS minification with Tailwind
- Component memoization for expensive renders

### Backend Optimization
- MongoDB indexing on frequently queried fields
- Connection pooling with Mongoose
- PDF caching after extraction
- Rate limiting on API endpoints (recommended for production)

## Security Best Practices

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ CORS protection enabled
- ✅ Environment variables for sensitive data
- ✅ Role-based access control on all endpoints
- ✅ Input validation on all routes
- ⚠️ **For Production**: Enable HTTPS, set strong JWT/SESSION secrets, use environment-specific configs

## Testing

### Manual Testing

1. **User Registration**: Create new accounts with different roles
2. **Document Upload**: Upload PDF files and verify extraction
3. **Quiz Generation**: Generate quizzes and verify question quality
4. **Quiz Taking**: Complete quizzes and check scoring
5. **Progress Tracking**: Verify quiz history and statistics

### Automated Testing

Run the endpoint test suite:

```bash
cd server
npm run test:endpoints
```

See [TEST_RESULTS.md](./TEST_RESULTS.md) for detailed test results.

## Deployment

### Heroku Deployment

1. Create `Procfile` in root:
   ```
   web: npm start
   ```

2. Set environment variables:
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set MONGODB_URL=your_mongodb_url
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Docker Deployment

```bash
docker build -t docquizai .
docker run -p 3000:3000 -p 5173:5173 docquizai
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong, random JWT and SESSION secrets
- [ ] Use MongoDB Atlas for managed database
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure email notifications (optional)
- [ ] Implement rate limiting
- [ ] Set up automated backups
- [ ] Review and audit security settings

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Support for multiple document formats (Word, PowerPoint, etc.)
- [ ] Advanced analytics and reporting dashboard
- [ ] Export quiz attempts to CSV
- [ ] Email notifications for quiz completion
- [ ] Multi-language support
- [ ] Mobile native apps (React Native)
- [ ] Real-time collaborative quiz creation
- [ ] Integration with LMS platforms (Canvas, Blackboard, etc.)
- [ ] Custom AI model fine-tuning
- [ ] Quiz templates and library

## Support

For issues, questions, or suggestions:

1. Check [API_REFERENCE.md](./API_REFERENCE.md) for API details
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture
3. Check [TEST_RESULTS.md](./TEST_RESULTS.md) for testing info
4. Open an issue on GitHub
5. Contact the development team

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude AI API
- [React](https://react.dev/) for the UI framework
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [MongoDB](https://www.mongodb.com/) for database
- [Express.js](https://expressjs.com/) for web framework

## Contact

- GitHub: [Your GitHub URL]
- Email: support@docquizai.com
- Website: [Your Website]

---

**Happy Learning! 🚀**

For the latest updates and documentation, visit the [project repository](https://github.com/yourusername/DocQuizAI).
