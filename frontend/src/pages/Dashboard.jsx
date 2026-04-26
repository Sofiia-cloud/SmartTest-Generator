import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizzes } from "../services/api";

function Dashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await quizzes.getAll();
      setTests(response.data);
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">SmartTest</h1>
          <div className="flex gap-4">
            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Админ-панель
              </button>
            )}
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Профиль
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Доступные тесты</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-400">Загрузка...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <p className="text-gray-400">Нет доступных тестов</p>
            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="mt-4 px-4 py-2 bg-purple-600 rounded-lg"
              >
                Создать первый тест
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition"
              >
                <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Сложность: {test.difficulty || "средняя"}</p>
                  <p>Проходной балл: {test.passing_score || 60}%</p>
                </div>
                <button
                  onClick={() => navigate(`/quiz/${test.id}`)}
                  className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                >
                  Начать тест
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
