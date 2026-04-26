import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import pool from "../models/db.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не загружен" });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    const result = await pool.query(
      "INSERT INTO documents (user_id, title, file_path, extracted_text) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, req.file.originalname, req.file.path, extractedText],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Ошибка загрузки документа" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения документов" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await pool.query(
      "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
      [id, req.user.id],
    );

    if (doc.rows.length > 0 && doc.rows[0].file_path) {
      fs.unlinkSync(doc.rows[0].file_path);
    }

    await pool.query("DELETE FROM documents WHERE id = $1", [id]);
    res.json({ message: "Документ удален" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления" });
  }
};
