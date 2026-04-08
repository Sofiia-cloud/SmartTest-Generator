import api from './api';
import { Document, DocumentUploadProgress } from '@/types/document';

// Description: Get all documents
// Endpoint: GET /api/documents
// Request: {}
// Response: { documents: Document[] }
export const getDocuments = async () => {
  try {
    const response = await api.get('/api/documents');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Upload a document
// Endpoint: POST /api/documents/upload
// Request: FormData with file
// Response: { document: Document }
export const uploadDocument = async (file: File, onProgress?: (progress: DocumentUploadProgress) => void) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            fileName: file.name,
            progress: percentCompleted,
            status: 'uploading',
          });
        }
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Delete a document
// Endpoint: DELETE /api/documents/:id
// Request: {}
// Response: { success: boolean }
export const deleteDocument = async (documentId: string) => {
  try {
    const response = await api.delete(`/api/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Get document by ID
// Endpoint: GET /api/documents/:id
// Request: {}
// Response: { document: Document }
export const getDocumentById = async (documentId: string) => {
  try {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};