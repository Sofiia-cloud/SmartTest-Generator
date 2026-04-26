import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzes } from "../services/api";

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gray-800 rounded-xl p-8 text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">Результат теста</h2>
            <div className="text-6xl font-bold text-purple-400 mb-2">
              {result.scorePercent}%
            </div>
            <p className="text-lg">
              {result.passed ? "✅ Тест сдан!" : "❌ Тест не сдан"}
            </p>
            <p className="text-gray-400 mt-2">
              Правильных ответов: {result.correctCount} из{" "}
              {result.totalQuestions}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-purple-600 rounded-lg"
            >
              На главную
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Детальный разбор</h3>
            {result.details?.map((detail, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${detail.isCorrect ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}
              >
                <p className="font-medium mb-2">
                  {idx + 1}. {detail.questionText}
                </p>
                <p className="text-sm text-gray-400">
                  Ваш ответ:{detail.userAnswerText}{" "}
                  {detail.userAnswerId === detail.correctAnswerId ? "✓" : "✗"}
                  <br />
                  Правильный ответ: {detail.correctAnswerText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">Вопросы не найдены</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-xl p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{quiz?.title}</h1>
            <span className="text-sm text-gray-400">
              Вопрос {currentIndex + 1} из {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">
              {currentQuestion.question_text}
            </h3>
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650"
                >
                  <input
                    type="radio"
                    name="question"
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswer(currentQuestion.id, option.id)}
                    className="mr-3"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              disabled={currentIndex === 0}
              className="px-6 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
            >
              Назад
            </button>
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 rounded-lg"
              >
                Завершить
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-6 py-2 bg-purple-600 rounded-lg"
              >
                Далее
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;
