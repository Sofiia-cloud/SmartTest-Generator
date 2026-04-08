import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import documentService from '../services/documentService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ROLES } from 'shared';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

interface AuthRequest extends Request {
  user?: any;
}

// Description: Upload a new document
// Endpoint: POST /api/documents/upload
// Request: FormData with file
// Response: { document: Document }
router.post('/upload', requireUser([ROLES.ADMIN]), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`Uploading document: ${req.file.originalname}`);

    const document = await documentService.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      userId: req.user._id,
      filePath: req.file.path,
    });

    res.status(200).json({ document });
  } catch (error) {
    console.error(`Error uploading document: ${error}`);
    if (req.file) {
      documentService.deleteFile(req.file.path);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload document' });
  }
});

// Description: Get all documents
// Endpoint: GET /api/documents
// Request: {}
// Response: { documents: Document[] }
router.get('/', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const documents = await documentService.getUserDocuments(req.user._id);
    res.status(200).json({ documents });
  } catch (error) {
    console.error(`Error fetching documents: ${error}`);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Description: Get document by ID
// Endpoint: GET /api/documents/:id
// Request: {}
// Response: { document: Document }
router.get('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const document = await documentService.getById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns this document
    if (document.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error(`Error fetching document: ${error}`);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Description: Delete a document
// Endpoint: DELETE /api/documents/:id
// Request: {}
// Response: { success: boolean }
router.delete('/:id', requireUser([ROLES.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const document = await documentService.getById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns this document
    if (document.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const success = await documentService.delete(req.params.id);

    if (success) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error(`Error deleting document: ${error}`);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
