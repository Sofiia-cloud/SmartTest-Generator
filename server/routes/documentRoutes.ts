import express, { Request, Response } from "express";
import { requireUser } from "./middlewares/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../config/data-source";
import { Document } from "../models/Document.entity";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Upload a new document
router.post(
  "/upload",
  requireUser(["admin"]),
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const documentRepo = AppDataSource.getRepository(Document);

      const document = new Document();
      document.title = req.file.originalname;
      document.filePath = req.file.path;
      document.userId = req.user.id;
      document.extractedText = null;
      document.uploadedAt = new Date();

      await documentRepo.save(document);

      res.status(200).json({ document });
    } catch (error) {
      console.error("Error uploading document:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload document" });
    }
  },
);

// Get all documents for current user
router.get(
  "/",
  requireUser(["admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const documentRepo = AppDataSource.getRepository(Document);
      const documents = await documentRepo.find({
        where: { userId: req.user.id },
        order: { uploadedAt: "DESC" },
      });
      res.status(200).json({ documents });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  },
);

// Get document by ID
router.get(
  "/:id",
  requireUser(["admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const documentRepo = AppDataSource.getRepository(Document);
      const document = await documentRepo.findOne({
        where: { id: req.params.id },
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (document.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.status(200).json({ document });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  },
);

// Delete a document
router.delete(
  "/:id",
  requireUser(["admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const documentRepo = AppDataSource.getRepository(Document);
      const document = await documentRepo.findOne({
        where: { id: req.params.id },
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (document.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Delete file from disk
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await documentRepo.delete(document.id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  },
);

export default router;
