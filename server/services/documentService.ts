import DocumentModel, { IDocument } from '../models/Document';
import { extractPdfContent } from './pdfParseService';
import fs from 'fs';

class DocumentService {
  /**
   * Create a new document
   */
  async create(data: {
    fileName: string;
    fileSize: number;
    userId: string;
    filePath: string;
  }): Promise<IDocument> {
    try {
      console.log(`Creating document: ${data.fileName} for user: ${data.userId}`);

      // Extract PDF content
      let content = '';
      try {
        content = await extractPdfContent(data.filePath);
      } catch (error) {
        console.error(`Failed to extract PDF content: ${error}`);
        // Continue with empty content, document will be marked as error later
      }

      // Create document in database
      const document = new DocumentModel({
        fileName: data.fileName,
        fileSize: data.fileSize,
        userId: data.userId,
        content: content,
        status: content ? 'ready' : 'error',
        errorMessage: content ? undefined : 'Failed to extract PDF content',
      });

      const savedDocument = await document.save();
      console.log(`Document created successfully: ${savedDocument._id}`);

      return savedDocument;
    } catch (error) {
      console.error(`Error creating document: ${error}`);
      throw error;
    }
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string): Promise<IDocument[]> {
    try {
      const documents = await DocumentModel.find({ userId }).sort({ uploadDate: -1 });
      return documents;
    } catch (error) {
      console.error(`Error fetching user documents: ${error}`);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(documentId: string): Promise<IDocument | null> {
    try {
      const document = await DocumentModel.findById(documentId);
      return document;
    } catch (error) {
      console.error(`Error fetching document by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update document status
   */
  async updateStatus(
    documentId: string,
    status: 'processing' | 'ready' | 'error',
    errorMessage?: string
  ): Promise<IDocument | null> {
    try {
      const updateData: any = { status };
      if (errorMessage) {
        updateData.errorMessage = errorMessage;
      }

      const document = await DocumentModel.findByIdAndUpdate(documentId, updateData, { new: true });
      return document;
    } catch (error) {
      console.error(`Error updating document status: ${error}`);
      throw error;
    }
  }

  /**
   * Delete document by ID
   */
  async delete(documentId: string): Promise<boolean> {
    try {
      const result = await DocumentModel.findByIdAndDelete(documentId);
      if (result) {
        console.log(`Document deleted: ${documentId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting document: ${error}`);
      throw error;
    }
  }

  /**
   * Update quiz count for a document
   */
  async updateQuizCount(documentId: string, increment: number = 1): Promise<IDocument | null> {
    try {
      const document = await DocumentModel.findByIdAndUpdate(
        documentId,
        { $inc: { quizCount: increment } },
        { new: true }
      );
      return document;
    } catch (error) {
      console.error(`Error updating quiz count: ${error}`);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
      return false;
    }
  }
}

export default new DocumentService();
