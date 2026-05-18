import express from "express";
import {
  upload,
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js"; // 👈 импортируем логирование

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

// Загрузка документа
router.post(
  "/upload",
  upload.single("file"),
  auditLog("UPLOAD_DOCUMENT", async (req) => {
    return `Файл: ${req.file?.originalname || "unknown"}, размер: ${req.file?.size || 0} байт`;
  }),
  uploadDocument,
);

// Получение списка документов
router.get(
  "/",
  auditLog("GET_DOCUMENTS", async (req) => {
    return `Пользователь ${req.user.email} запросил список документов`;
  }),
  getDocuments,
);

// Удаление документа
router.delete(
  "/:id",
  auditLog("DELETE_DOCUMENT", async (req) => {
    return `Пользователь ${req.user.email} удалил документ id=${req.params.id}`;
  }),
  deleteDocument,
);

export default router;
