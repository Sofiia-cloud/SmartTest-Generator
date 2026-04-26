import express from "express";
import {
  upload,
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.delete("/:id", deleteDocument);

export default router;
