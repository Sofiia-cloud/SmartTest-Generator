import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role = "student",
      first_name,
      last_name,
    } = req.body;

    const validRoles = ["admin", "student"];
    const userRole = validRoles.includes(role) ? role : "student";

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, first_name, last_name",
      [email, hashedPassword, userRole, first_name || null, last_name || null],
    );

    const token = jwt.sign(
      {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, user: result.rows[0] });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Ошибка регистрации" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Ошибка входа" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения данных пользователя" });
  }
};

// Получение профиля пользователя (расширенный)
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Ошибка получения профиля" });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const userId = req.user.id;

    // Валидация
    if (first_name && (first_name.length < 2 || first_name.length > 100)) {
      return res
        .status(400)
        .json({ error: "Имя должно быть от 2 до 100 символов" });
    }

    if (last_name && (last_name.length < 2 || last_name.length > 100)) {
      return res
        .status(400)
        .json({ error: "Фамилия должна быть от 2 до 100 символов" });
    }

    // Обновление данных
    const result = await pool.query(
      `UPDATE users 
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, email, first_name, last_name, role, created_at`,
      [first_name, last_name, userId],
    );

    // Логирование
    console.log(
      `[${new Date().toISOString()}] Пользователь ${req.user.email} обновил профиль`,
    );

    res.json({
      message: "Профиль успешно обновлен",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Ошибка обновления профиля" });
  }
};

// Изменение пароля
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Валидация
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ error: "Новый пароль должен быть не менее 6 символов" });
    }

    // Получение текущего пользователя
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );
    const user = userResult.rows[0];

    // Проверка текущего пароля
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Неверный текущий пароль" });
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Обновление пароля
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, userId],
    );

    console.log(
      `[${new Date().toISOString()}] Пользователь ${req.user.email} изменил пароль`,
    );

    res.json({ message: "Пароль успешно изменен" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Ошибка изменения пароля" });
  }
};
