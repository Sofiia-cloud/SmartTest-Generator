import pool from "../models/db.js";
import { generateQuestionsWithYandexGPT } from "../utils/yandexGpt.js";

export const generateQuiz = async (req, res) => {
  try {
    const {
      documentId,
      title,
      questionCount = 5,
      difficulty = "medium",
      passingScore = 60,
    } = req.body;

    const docResult = await pool.query(
      "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
      [documentId, req.user.id],
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: "Документ не найден" });
    }

    const document = docResult.rows[0];
    const questions = await generateQuestionsWithYandexGPT(
      document.extracted_text,
      questionCount,
      difficulty,
    );

    const quizResult = await pool.query(
      "INSERT INTO quizzes (document_id, creator_id, title, difficulty, passing_score) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [documentId, req.user.id, title, difficulty, passingScore],
    );

    const quiz = quizResult.rows[0];

    for (const q of questions) {
      const questionResult = await pool.query(
        "INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING *",
        [quiz.id, q.question],
      );

      const questionId = questionResult.rows[0].id;

      for (let i = 0; i < q.options.length; i++) {
        await pool.query(
          "INSERT INTO answer_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)",
          [questionId, q.options[i], i === q.correct],
        );
      }
    }

    res.json({ quizId: quiz.id, message: "Тест успешно сгенерирован" });
  } catch (error) {
    console.error("Generate quiz error:", error);
    res.status(500).json({ error: "Ошибка генерации теста" });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === "admin") {
      query = `SELECT q.*, u.email as creator_email, d.title as document_title 
                     FROM quizzes q 
                     LEFT JOIN users u ON q.creator_id = u.id 
                     LEFT JOIN documents d ON q.document_id = d.id 
                     ORDER BY q.created_at DESC`;
      params = [];
    } else {
      query = `SELECT * FROM quizzes WHERE published = true ORDER BY created_at DESC`;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения тестов" });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await pool.query("SELECT * FROM quizzes WHERE id = $1", [
      id,
    ]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: "Тест не найден" });
    }

    const questionsResult = await pool.query(
      `SELECT q.*, 
                    json_agg(json_build_object('id', ao.id, 'text', ao.option_text, 'is_correct', ao.is_correct)) as options
             FROM questions q
             LEFT JOIN answer_options ao ON q.id = ao.question_id
             WHERE q.quiz_id = $1
             GROUP BY q.id`,
      [id],
    );

    res.json({
      quiz: quizResult.rows[0],
      questions: questionsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения теста" });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE quizzes SET published = true WHERE id = $1", [id]);
    res.json({ message: "Тест опубликован" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка публикации" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const questionsResult = await pool.query(
      `SELECT q.id, q.question_text, 
                    json_agg(json_build_object('id', ao.id, 'text', ao.option_text, 'is_correct', ao.is_correct)) as options
             FROM questions q
             LEFT JOIN answer_options ao ON q.id = ao.question_id
             WHERE q.quiz_id = $1
             GROUP BY q.id`,
      [id],
    );

    let correctCount = 0;
    const answerDetails = [];

    for (const question of questionsResult.rows) {
      const userAnswer = answers[question.id];
      const correctOption = question.options.find((opt) => opt.is_correct);
      const isCorrect = userAnswer === correctOption?.id;

      if (isCorrect) correctCount++;

      answerDetails.push({
        questionId: question.id,
        questionText: question.question_text,
        userAnswerId: userAnswer,
        correctAnswerId: correctOption?.id,
        correctAnswerText: correctOption?.text,
        isCorrect,
      });
    }

    const scorePercent = Math.round(
      (correctCount / questionsResult.rows.length) * 100,
    );
    const passed = scorePercent >= 60;

    await pool.query(
      `INSERT INTO quiz_attempts (quiz_id, user_id, score_percent, passed, answers_json, completed_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [id, req.user.id, scorePercent, passed, JSON.stringify(answerDetails)],
    );

    res.json({
      scorePercent,
      passed,
      correctCount,
      totalQuestions: questionsResult.rows.length,
      details: answerDetails,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ error: "Ошибка сохранения результата" });
  }
};

export const getAttempts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qa.*, q.title as quiz_title 
             FROM quiz_attempts qa
             LEFT JOIN quizzes q ON qa.quiz_id = q.id
             WHERE qa.user_id = $1
             ORDER BY qa.started_at DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения истории" });
  }
};
