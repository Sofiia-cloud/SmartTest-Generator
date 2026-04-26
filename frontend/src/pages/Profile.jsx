import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizzes } from "../services/api";

function Profile() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const response = await quizzes.getAttempts();
      setAttempts(response.data);
    } catch (error) {
      console.error("Error loading attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Личный кабинет</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-700 rounded-lg"
            >
              На главную
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-2">Информация</h2>
          <p>
            <span className="text-gray-400">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-gray-400">Роль:</span>{" "}
            {user.role === "admin" ? "Администратор" : "Студент"}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">История прохождений</h2>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              У вас пока нет пройденных тестов
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Дата</th>
                    <th className="text-left py-2">Тест</th>
                    <th className="text-left py-2">Результат</th>
                    <th className="text-left py-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-gray-700">
                      <td className="py-2">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">{attempt.quiz_title}</td>
                      <td className="py-2">{attempt.score_percent}%</td>
                      <td className="py-2">
                        {attempt.passed ? (
                          <span className="text-green-400">Сдано</span>
                        ) : (
                          <span className="text-red-400">Не сдано</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
