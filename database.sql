-- Создание базы данных
CREATE DATABASE smarttest_db;

-- Подключение к базе
\c smarttest_db;

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица документов
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path TEXT,
    extracted_text TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тестов (квизов)
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    creator_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50),
    passing_score INTEGER DEFAULT 60,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица вопросов
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    points INTEGER DEFAULT 1
);

-- Таблица вариантов ответов
CREATE TABLE answer_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- Таблица попыток прохождения
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id),
    user_id INTEGER REFERENCES users(id),
    score_percent INTEGER,
    passed BOOLEAN,
    answers_json JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Вставка тестового администратора (email: admin@test.com, password: admin123)
-- Пароль хеширован через bcrypt: "admin123" -> $2b$10$... (вставьте после запуска приложения)
INSERT INTO users (email, password_hash, role) VALUES 
('admin@test.com', '$2b$10$YjZqGq5xLq5xLq5xLq5xLu5xLq5xLq5xLq5xLq5xLq5xLq5xLq5', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Добавление полей в существующую таблицу
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;