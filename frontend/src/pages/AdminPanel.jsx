import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documents, quizzes } from "../services/api";

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

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Админ-панель</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Документы */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Документы</h2>
            <div className="mb-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-2"
              />
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full py-2 bg-purple-600 rounded-lg disabled:opacity-50"
              >
                {uploading ? "Загрузка..." : "Загрузить PDF"}
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {docList.map((doc) => (
                <div key={doc.id} className="bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {docList.length === 0 && (
                <p className="text-gray-500 text-center">Нет документов</p>
              )}
            </div>
          </div>

          {/* Тесты */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Тесты</h2>
            <button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="w-full mb-4 py-2 bg-green-600 rounded-lg"
            >
              + Сгенерировать новый тест
            </button>

            {showGenerateForm && (
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full mb-2 p-2 bg-gray-600 rounded"
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
                  className="w-full mb-2 p-2 bg-gray-600 rounded"
                />
                <input
                  type="number"
                  placeholder="Количество вопросов (5-20)"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.min(20, Math.max(5, parseInt(e.target.value) || 5)),
                    )
                  }
                  className="w-full mb-2 p-2 bg-gray-600 rounded"
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full mb-2 p-2 bg-gray-600 rounded"
                >
                  <option value="easy">Лёгкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
                <input
                  type="number"
                  placeholder="Проходной балл (0-100)"
                  value={passingScore}
                  onChange={(e) =>
                    setPassingScore(
                      Math.min(
                        100,
                        Math.max(0, parseInt(e.target.value) || 60),
                      ),
                    )
                  }
                  className="w-full mb-2 p-2 bg-gray-600 rounded"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-2 bg-purple-600 rounded-lg"
                >
                  {generating ? "Генерация..." : "Сгенерировать тест"}
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {quizList.map((quiz) => (
                <div key={quiz.id} className="bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium">{quiz.title}</p>
                  <p className="text-sm text-gray-400">
                    Сложность: {quiz.difficulty}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {!quiz.published && (
                      <button
                        onClick={() => handlePublish(quiz.id)}
                        className="px-3 py-1 bg-green-600 rounded text-sm"
                      >
                        Опубликовать
                      </button>
                    )}
                    {quiz.published && (
                      <span className="px-3 py-1 bg-green-800 rounded text-sm">
                        Опубликован
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {quizList.length === 0 && (
                <p className="text-gray-500 text-center">Нет тестов</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
