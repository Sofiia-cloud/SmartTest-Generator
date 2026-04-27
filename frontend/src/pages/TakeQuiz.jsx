import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { quizzes } from "../services/api";

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await quizzes.getById(id);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error loading quiz:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert(
        `Ответьте на все вопросы! (${Object.keys(answers).length}/${questions.length})`,
      );
      return;
    }

    try {
      const response = await quizzes.submit(id, answers);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      alert("Ошибка при отправке результатов");
    }
  };

  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
        }`}
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#c4a87a] border-t-transparent rounded-full animate-spin"></div>
          <p
            className={`mt-3 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
          >
            Загрузка теста...
          </p>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div
        className={`min-h-screen py-8 transition-colors duration-300 ${
          theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4">
          {/* Result Card */}
          <div
            className={`rounded-2xl p-8 text-center mb-6 transition-all duration-300 ${
              theme === "light"
                ? "bg-white border border-[#e8ddd0] shadow-sm"
                : "bg-[#241d17] border border-[#362b22] shadow-lg"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-2 ${
                theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
              }`}
            >
              {result.passed ? "Тест сдан!" : "Тест не сдан"}
            </h2>
            <div
              className={`text-5xl font-bold mb-2 ${
                theme === "light" ? "text-[#d4b896]" : "text-[#c4a87a]"
              }`}
            >
              {result.scorePercent}%
            </div>
            <p
              className={`text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
            >
              Правильных ответов: {result.correctCount} из{" "}
              {result.totalQuestions}
            </p>
            <button
              onClick={() => navigate("/")}
              className={`mt-6 px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                theme === "light"
                  ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                  : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
              }`}
            >
              На главную
            </button>
          </div>

          {/* Detailed Breakdown */}
          <div
            className={`rounded-2xl p-6 transition-all duration-300 ${
              theme === "light"
                ? "bg-white border border-[#e8ddd0] shadow-sm"
                : "bg-[#241d17] border border-[#362b22] shadow-lg"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
              }`}
            >
              Детальный разбор
            </h3>
            <div className="space-y-3">
              {result.details?.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    detail.isCorrect
                      ? theme === "light"
                        ? "bg-green-50 border border-green-200"
                        : "bg-green-900/20 border border-green-800"
                      : theme === "light"
                        ? "bg-red-50 border border-red-200"
                        : "bg-red-900/20 border border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        detail.isCorrect
                          ? theme === "light"
                            ? "bg-green-500 text-white"
                            : "bg-green-600 text-white"
                          : theme === "light"
                            ? "bg-red-500 text-white"
                            : "bg-red-600 text-white"
                      }`}
                    >
                      {detail.isCorrect ? "✓" : "✗"}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium mb-2 ${
                          theme === "light"
                            ? "text-[#3d2b1f]"
                            : "text-[#f5ede0]"
                        }`}
                      >
                        {idx + 1}. {detail.questionText}
                      </p>
                      <div
                        className={`text-sm space-y-1 ${
                          theme === "light"
                            ? "text-[#6b4c3a]"
                            : "text-[#d4c5b5]"
                        }`}
                      >
                        <p>
                          <span className="opacity-70">Правильный ответ:</span>{" "}
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {detail.correctAnswerText}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
        }`}
      >
        <div
          className={`text-center p-8 rounded-2xl ${
            theme === "light"
              ? "bg-white border border-[#e8ddd0]"
              : "bg-[#241d17] border border-[#362b22]"
          }`}
        >
          <div className="text-5xl mb-4">📭</div>
          <p
            className={theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}
          >
            Вопросы не найдены
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 transition-colors duration-300 ${
        theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Quiz Card */}
        <div
          className={`rounded-2xl p-6 transition-all duration-300 ${
            theme === "light"
              ? "bg-white border border-[#e8ddd0] shadow-sm"
              : "bg-[#241d17] border border-[#362b22] shadow-lg"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="w-10 h-1 rounded-full mb-3 bg-gradient-to-r from-[#d4b896] to-[#c4a87a]"></div>
              <h1
                className={`text-xl font-bold ${
                  theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                }`}
              >
                {quiz?.title}
              </h1>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                theme === "light"
                  ? "bg-[#f5efe6] text-[#a88b74]"
                  : "bg-[#2d241d] text-[#6b4c3a]"
              }`}
            >
              Вопрос {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className={`w-full rounded-full h-2 mb-6 ${
              theme === "light" ? "bg-[#f0e9df]" : "bg-[#2d241d]"
            }`}
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: "linear-gradient(90deg, #d4b896 0%, #c4a87a 100%)",
              }}
            />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3
              className={`text-lg font-medium mb-4 ${
                theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
              }`}
            >
              {currentQuestion.question_text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options?.map((option, optIdx) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    answers[currentQuestion.id] === option.id
                      ? theme === "light"
                        ? "bg-[#d4b896]/20 border-2 border-[#d4b896]"
                        : "bg-[#4a3b2e] border-2 border-[#c4a87a]"
                      : theme === "light"
                        ? "bg-[#faf7f2] border border-[#e8ddd0] hover:bg-[#f5efe6]"
                        : "bg-[#2d241d] border border-[#362b22] hover:bg-[#362b22]"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                        answers[currentQuestion.id] === option.id
                          ? "bg-[#d4b896] text-white"
                          : theme === "light"
                            ? "bg-[#f0e9df] text-[#a88b74]"
                            : "bg-[#362b22] text-[#6b4c3a]"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <input
                      type="radio"
                      name="question"
                      value={option.id}
                      checked={answers[currentQuestion.id] === option.id}
                      onChange={() =>
                        handleAnswer(currentQuestion.id, option.id)
                      }
                      className="hidden"
                    />
                    <span
                      className={`flex-1 ${
                        theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                      }`}
                    >
                      {option.text}
                    </span>
                    {answers[currentQuestion.id] === option.id && (
                      <span className="text-[#d4b896] text-lg">✓</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              } ${
                theme === "light"
                  ? "bg-[#f0e9df] text-[#6b4c3a] hover:bg-[#e8ddd0]"
                  : "bg-[#362b22] text-[#d4c5b5] hover:bg-[#4a3b2e]"
              }`}
            >
              ← Назад
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  theme === "light"
                    ? "bg-[#c4a87a] text-white hover:bg-[#d4b896]"
                    : "bg-[#4a3b2e] text-[#f5ede0] hover:bg-[#5c4a3a]"
                }`}
              >
                Завершить
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  theme === "light"
                    ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                    : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                }`}
              >
                Далее →
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div
          className={`text-center mt-4 text-sm ${
            theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
          }`}
        >
          {Object.keys(answers).length} из {questions.length} вопросов отвечено
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;
