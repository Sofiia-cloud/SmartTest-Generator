import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  documentId: string;
  documentName: string;
  questions: IQuizQuestion[];
  settings: {
    numberOfQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    timeLimit?: number;
    passingScore: number;
    category?: string;
  };
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  _id: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 2 && v.length <= 5,
      message: 'Options must have between 2 and 5 choices',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  explanation: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
}, { _id: false });

const schema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  documentId: {
    type: String,
    required: true,
    index: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  questions: {
    type: [quizQuestionSchema],
    default: [],
  },
  settings: {
    numberOfQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      required: true,
    },
    timeLimit: {
      type: Number,
      // Optional, in minutes
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
    },
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  createdBy: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

const QuizModel = mongoose.model<IQuiz>('Quiz', schema);

export default QuizModel;
