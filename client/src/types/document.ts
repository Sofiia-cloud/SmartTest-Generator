export interface Document {
  _id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
  quizCount: number;
  thumbnailUrl?: string;
}

export interface DocumentUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}