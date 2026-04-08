import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'error';
  content: string; // Extracted PDF text content
  userId: string; // Admin who uploaded
  quizCount: number;
  errorMessage?: string;
}

const schema = new Schema<IDocument>({
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing',
  },
  content: {
    type: String,
    default: '',
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  quizCount: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
  },
}, {
  versionKey: false,
});

const DocumentModel = mongoose.model<IDocument>('Document', schema);

export default DocumentModel;
