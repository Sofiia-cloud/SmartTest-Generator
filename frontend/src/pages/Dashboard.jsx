import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { quizzes } from "../services/api";

function Dashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme } = useTheme();

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
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
      }`}
    >
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with stats */}
        <div className="mb-8">
          <h2
            className={`text-2xl font-bold mb-2 ${
              theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
            }`}
          >
            Доступные тесты
          </h2>
          <p
            className={`text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
          >
            Выберите тест для прохождения
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-[#c4a87a] border-t-transparent rounded-full animate-spin"></div>
            <p
              className={`mt-2 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
            >
              Загрузка тестов...
            </p>
          </div>
        ) : tests.length === 0 ? (
          <div
            className={`text-center py-12 rounded-2xl transition-all duration-300 ${
              theme === "light"
                ? "bg-white border border-[#e8ddd0]"
                : "bg-[#241d17] border border-[#362b22]"
            }`}
          >
            <p
              className={`${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
            >
              Нет доступных тестов
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className={`mt-4 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                    : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                }`}
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
                className={`group rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  theme === "light"
                    ? "bg-white border border-[#e8ddd0] shadow-sm hover:shadow-md"
                    : "bg-[#241d17] border border-[#362b22] shadow-lg hover:shadow-xl"
                }`}
                onClick={() => navigate(`/quiz/${test.id}`)}
              >
                <h3
                  className={`text-lg font-bold mb-3 line-clamp-2 ${
                    theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                  }`}
                >
                  {test.title}
                </h3>

                {/* Decorative line */}
                <div className="w-12 h-1 rounded-full mb-4 bg-gradient-to-r from-[#d4b896] to-[#c4a87a]"></div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                      }
                    >
                      Сложность
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        test.difficulty === "easy"
                          ? theme === "light"
                            ? "bg-green-100 text-green-700"
                            : "bg-green-900/30 text-green-400"
                          : test.difficulty === "hard"
                            ? theme === "light"
                              ? "bg-red-100 text-red-700"
                              : "bg-red-900/30 text-red-400"
                            : theme === "light"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {test.difficulty === "easy"
                        ? "Лёгкий"
                        : test.difficulty === "hard"
                          ? "Сложный"
                          : "Средний"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={
                        theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                      }
                    >
                      Проходной балл
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                      }`}
                    >
                      {test.passing_score || 60}%
                    </span>
                  </div>
                </div>

                <button
                  className={`mt-5 w-full py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3 ${
                    theme === "light"
                      ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                      : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                  }`}
                >
                  <span>Начать тест</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
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
