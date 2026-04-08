import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt extends Document {
  quizId: string;
  quizTitle: string;
  studentId: string;
  answers: { [questionId: string]: number }; // question ID -> selected option index
  score: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number; // in seconds
}

const schema = new Schema<IQuizAttempt>({
  quizId: {
    type: String,
    required: true,
    index: true,
  },
  quizTitle: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
    index: true,
  },
  answers: {
    type: Schema.Types.Mixed,
    default: {},
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  versionKey: false,
});

const QuizAttemptModel = mongoose.model<IQuizAttempt>('QuizAttempt', schema);

export default QuizAttemptModel;
