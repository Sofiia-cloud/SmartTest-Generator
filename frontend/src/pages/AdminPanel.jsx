import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documents, quizzes } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function AdminPanel() {
  const [docList, setDocList] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const [passingScore, setPassingScore] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsRes, quizzesRes] = await Promise.all([
        documents.getAll(),
        quizzes.getAll(),
      ]);
      setDocList(docsRes.data);
      setQuizList(quizzesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await documents.upload(selectedFile);
      setSelectedFile(null);
      loadData();
      alert("Документ загружен");
    } catch (error) {
      alert("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDocId || !quizTitle) {
      alert("Заполните все поля");
      return;
    }
    setGenerating(true);
    try {
      await quizzes.generate({
        documentId: selectedDocId,
        title: quizTitle,
        questionCount,
        difficulty,
        passingScore,
      });
      setShowGenerateForm(false);
      setSelectedDocId("");
      setQuizTitle("");
      loadData();
      alert("Тест сгенерирован!");
    } catch (error) {
      alert("Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await quizzes.publish(id);
      loadData();
      alert("Тест опубликован");
    } catch (error) {
      alert("Ошибка публикации");
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Документы */}
          <div
            className={`rounded-2xl p-6 transition-all duration-300 ${
              theme === "light"
                ? "bg-white border border-[#e8ddd0] shadow-sm"
                : "bg-[#241d17] border border-[#362b22] shadow-lg"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Документы</h2>
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"}`}
              >
                Загрузить PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className={`w-full mb-2 text-sm ${
                  theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                } file:mr-3 file:py-2 file:px-4 file:rounded-xl file:text-sm file:font-medium file:border-0 ${
                  theme === "light"
                    ? "file:bg-[#d4b896] file:text-[#3d2b1f] hover:file:bg-[#c4a87a]"
                    : "file:bg-[#5c4a3a] file:text-[#f5ede0] hover:file:bg-[#4a3b2e]"
                }`}
              />
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={`w-full py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
                  theme === "light"
                    ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                    : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Загрузка...
                  </span>
                ) : (
                  "Загрузить PDF"
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {docList.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    theme === "light"
                      ? "bg-[#f5efe6] hover:bg-[#f0e9df]"
                      : "bg-[#2d241d] hover:bg-[#362b22]"
                  }`}
                >
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p
                    className={`text-xs mt-1 ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                  >
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {docList.length === 0 && (
                <p
                  className={`text-center py-8 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                >
                  Нет загруженных документов
                </p>
              )}
            </div>
          </div>

          {/* Тесты */}
          <div
            className={`rounded-2xl p-6 transition-all duration-300 ${
              theme === "light"
                ? "bg-white border border-[#e8ddd0] shadow-sm"
                : "bg-[#241d17] border border-[#362b22] shadow-lg"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Тесты</h2>
            </div>

            <button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className={`w-full mb-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                theme === "light"
                  ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                  : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
              }`}
            >
              {showGenerateForm ? "Скрыть форму" : "+ Сгенерировать новый тест"}
            </button>

            {showGenerateForm && (
              <div
                className={`p-4 rounded-xl mb-4 transition-all duration-200 ${
                  theme === "light" ? "bg-[#f5efe6]" : "bg-[#2d241d]"
                }`}
              >
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className={`w-full mb-3 p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                    theme === "light"
                      ? "bg-white border border-[#e8ddd0] text-[#3d2b1f]"
                      : "bg-[#241d17] border border-[#362b22] text-[#f5ede0]"
                  }`}
                >
                  <option value="">Выберите документ</option>
                  {docList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Название теста"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className={`w-full mb-3 p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                    theme === "light"
                      ? "bg-white border border-[#e8ddd0] text-[#3d2b1f] placeholder:text-[#a88b74]"
                      : "bg-[#241d17] border border-[#362b22] text-[#f5ede0] placeholder:text-[#6b4c3a]"
                  }`}
                />

                <label
                  className={`block text-sm mb-1 ${theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"}`}
                >
                  Количество вопросов (5-20)
                </label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.min(20, Math.max(5, parseInt(e.target.value) || 5)),
                    )
                  }
                  className={`w-full mb-3 p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                    theme === "light"
                      ? "bg-white border border-[#e8ddd0] text-[#3d2b1f]"
                      : "bg-[#241d17] border border-[#362b22] text-[#f5ede0]"
                  }`}
                />

                <label
                  className={`block text-sm mb-1 ${theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"}`}
                >
                  Уровень сложности
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full mb-3 p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                    theme === "light"
                      ? "bg-white border border-[#e8ddd0] text-[#3d2b1f]"
                      : "bg-[#241d17] border border-[#362b22] text-[#f5ede0]"
                  }`}
                >
                  <option value="easy">Лёгкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>

                <label
                  className={`block text-sm mb-1 ${theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"}`}
                >
                  Проходной балл (0-100)
                </label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) =>
                    setPassingScore(
                      Math.min(
                        100,
                        Math.max(0, parseInt(e.target.value) || 60),
                      ),
                    )
                  }
                  className={`w-full mb-3 p-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                    theme === "light"
                      ? "bg-white border border-[#e8ddd0] text-[#3d2b1f]"
                      : "bg-[#241d17] border border-[#362b22] text-[#f5ede0]"
                  }`}
                />

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`w-full py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    theme === "light"
                      ? "bg-[#c4a87a] text-[#3d2b1f] hover:bg-[#d4b896]"
                      : "bg-[#4a3b2e] text-[#f5ede0] hover:bg-[#5c4a3a]"
                  }`}
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Генерация...
                    </>
                  ) : (
                    "Сгенерировать тест"
                  )}
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    theme === "light"
                      ? "bg-[#f5efe6] hover:bg-[#f0e9df]"
                      : "bg-[#2d241d] hover:bg-[#362b22]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{quiz.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            quiz.difficulty === "easy"
                              ? theme === "light"
                                ? "bg-green-100 text-green-700"
                                : "bg-green-900/30 text-green-400"
                              : quiz.difficulty === "hard"
                                ? theme === "light"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-red-900/30 text-red-400"
                                : theme === "light"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-yellow-900/30 text-yellow-400"
                          }`}
                        >
                          {quiz.difficulty === "easy"
                            ? "Лёгкий"
                            : quiz.difficulty === "hard"
                              ? "Сложный"
                              : "Средний"}
                        </span>
                        <span
                          className={`text-xs ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                        >
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!quiz.published ? (
                        <button
                          onClick={() => handlePublish(quiz.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                            theme === "light"
                              ? "bg-[#c4a87a] text-[#3d2b1f] hover:bg-[#d4b896]"
                              : "bg-[#4a3b2e] text-[#f5ede0] hover:bg-[#5c4a3a]"
                          }`}
                        >
                          Опубликовать
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            theme === "light"
                              ? "bg-green-100 text-green-700"
                              : "bg-green-900/30 text-green-400"
                          }`}
                        >
                          ✓ Опубликован
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {quizList.length === 0 && (
                <p
                  className={`text-center py-8 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                >
                  Нет созданных тестов
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
