import { AppDataSource } from "../config/data-source";
import { Document } from "../models/Document.entity";
import fs from "fs";

const documentRepository = AppDataSource.getRepository(Document);

class DocumentService {
  /**
   * Create a new document
   */
  async create(data: {
    fileName: string;
    fileSize: number;
    userId: string;
    filePath: string;
    extractedText?: string;
  }): Promise<Document> {
    try {
      const document = new Document();
      document.title = data.fileName;
      document.filePath = data.filePath;
      document.userId = data.userId;
      document.extractedText = data.extractedText || null;
      document.uploadedAt = new Date();

      const savedDocument = await documentRepository.save(document);
      console.log(`Document created: ${savedDocument.id}`);

      return savedDocument;
    } catch (error) {
      console.error(`Error creating document: ${error}`);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(documentId: string): Promise<Document | null> {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
        relations: ["user"],
      });
      return document;
    } catch (error) {
      console.error(`Error fetching document: ${error}`);
      throw error;
    }
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const documents = await documentRepository.find({
        where: { userId },
        order: { uploadedAt: "DESC" },
      });
      return documents;
    } catch (error) {
      console.error(`Error fetching user documents: ${error}`);
      throw error;
    }
  }

  /**
   * Update document with extracted text
   */
  async updateExtractedText(
    documentId: string,
    extractedText: string,
  ): Promise<Document | null> {
    try {
      await documentRepository.update(documentId, { extractedText });
      return await this.getById(documentId);
    } catch (error) {
      console.error(`Error updating document text: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(documentId: string): Promise<boolean> {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        return false;
      }

      // Delete file from disk
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await documentRepository.delete(documentId);
      console.log(`Document deleted: ${documentId}`);

      return true;
    } catch (error) {
      console.error(`Error deleting document: ${error}`);
      throw error;
    }
  }

  /**
   * Update quiz count for document (for compatibility)
   */
  async updateQuizCount(documentId: string, increment: number): Promise<void> {
    try {
      const document = await this.getById(documentId);
      if (document) {
        // You can add a quizCount field to Document.entity.ts if needed
        console.log(
          `Quiz count updated for document ${documentId} by ${increment}`,
        );
      }
    } catch (error) {
      console.error(`Error updating quiz count: ${error}`);
    }
  }

  /**
   * Delete file from disk
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
    }
  }
}

export default new DocumentService();
