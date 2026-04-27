import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, quizzes } from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadProfile();
    loadAttempts();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await auth.getProfile();
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.updateProfile(formData);
      setProfile(response.data.user);
      setEditing(false);
      setMessage({ text: "Профиль успешно обновлен!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Ошибка обновления",
        type: "error",
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ text: "Новые пароли не совпадают", type: "error" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({
        text: "Пароль должен быть не менее 6 символов",
        type: "error",
      });
      return;
    }

    try {
      await auth.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setMessage({ text: "Пароль успешно изменен!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Ошибка изменения пароля",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Навигация */}
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Личный кабинет</h1>
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
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              На главную
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
        {/* Сообщения */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/50 border border-green-700 text-green-300"
                : "bg-red-900/50 border border-red-700 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Информация о пользователе */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {profile.first_name
                    ? profile.first_name[0].toUpperCase()
                    : user.email[0].toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : user.email}
                </h2>
                <p className="text-gray-400 mt-1">
                  {profile.role === "admin" ? "👨‍💼 Администратор" : "🎓 Студент"}
                </p>
                <p className="text-sm text-gray-500 mt-2">{profile.email}</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-semibold mb-3">Статистика</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Пройдено тестов:</span>
                    <span className="font-semibold">{attempts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Средний балл:</span>
                    <span className="font-semibold">
                      {attempts.length > 0
                        ? Math.round(
                            attempts.reduce(
                              (sum, a) => sum + a.score_percent,
                              0,
                            ) / attempts.length,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата регистрации:</span>
                    <span className="font-semibold">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Редактирование профиля */}
          <div className="lg:col-span-2 space-y-6">
            {/* Карточка редактирования профиля */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">👤 Личные данные</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition"
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Введите имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Введите фамилию"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          first_name: profile.first_name || "",
                          last_name: profile.last_name || "",
                        });
                      }}
                      className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-700">
                    <span className="w-24 text-gray-400">Имя:</span>
                    <span>{profile.first_name || "—"}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-700">
                    <span className="w-24 text-gray-400">Фамилия:</span>
                    <span>{profile.last_name || "—"}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-700">
                    <span className="w-24 text-gray-400">Email:</span>
                    <span>{profile.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Карточка смены пароля */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🔒 Безопасность</h2>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition"
                  >
                    Сменить пароль
                  </button>
                )}
              </div>

              {changingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Подтверждение нового пароля
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                    >
                      Сменить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordData({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                      className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  Пароль можно изменить в любой момент
                </div>
              )}
            </div>

            {/* История прохождений */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">📊 История прохождений</h2>
              {loading ? (
                <div className="text-center py-8">Загрузка...</div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Вы ещё не прошли ни одного теста
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
                        <tr
                          key={attempt.id}
                          className="border-b border-gray-700"
                        >
                          <td className="py-2 text-sm">
                            {new Date(attempt.started_at).toLocaleDateString()}
                          </td>
                          <td className="py-2">{attempt.quiz_title}</td>
                          <td className="py-2 font-semibold">
                            {attempt.score_percent}%
                          </td>
                          <td className="py-2">
                            {attempt.passed ? (
                              <span className="text-green-400">✅ Сдано</span>
                            ) : (
                              <span className="text-red-400">❌ Не сдано</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
