import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth, quizzes } from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    created_at: "",
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
  const { logout, updateUser, user: authUser } = useAuth();
  const { theme } = useTheme();

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
      updateUser(response.data.user);
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
        {/* Messages */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
              message.type === "success"
                ? theme === "light"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-green-900/20 border border-green-800 text-green-400"
                : theme === "light"
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-red-900/20 border border-red-800 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-8 rounded-2xl p-6 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-[#e8ddd0] shadow-sm"
                  : "bg-[#241d17] border border-[#362b22] shadow-lg"
              }`}
            >
              <div className="text-center mb-6">
                <div
                  className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md"
                  style={{
                    background:
                      theme === "light"
                        ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                        : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
                  }}
                >
                  <span className="text-4xl text-white">
                    {profile.first_name
                      ? profile.first_name[0].toUpperCase()
                      : authUser?.email?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                  }`}
                >
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : authUser?.email?.split("@")[0] || "Пользователь"}
                </h2>
                <p
                  className={`text-sm mt-1 ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                >
                  {profile.role === "admin" ? "Администратор" : "Студент"}
                </p>
                <p
                  className={`text-xs mt-2 ${theme === "light" ? "text-[#c4afa0]" : "text-[#5c4a3a]"}`}
                >
                  {profile.email}
                </p>
              </div>

              <div
                className={`pt-4 border-t ${theme === "light" ? "border-[#e8ddd0]" : "border-[#362b22]"}`}
              >
                <h3
                  className={`font-semibold mb-3 ${theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"}`}
                >
                  Статистика
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span
                      className={
                        theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                      }
                    >
                      Пройдено тестов:
                    </span>
                    <span
                      className={`font-semibold ${theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"}`}
                    >
                      {attempts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={
                        theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                      }
                    >
                      Средний балл:
                    </span>
                    <span
                      className={`font-semibold ${theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"}`}
                    >
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
                    <span
                      className={
                        theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                      }
                    >
                      Дата регистрации:
                    </span>
                    <span
                      className={`font-semibold ${theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"}`}
                    >
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Edit Card */}
            <div
              className={`rounded-2xl p-6 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-[#e8ddd0] shadow-sm"
                  : "bg-[#241d17] border border-[#362b22] shadow-lg"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className={`text-xl font-bold flex items-center gap-2 ${
                    theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                  }`}
                >
                  Личные данные
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      theme === "light"
                        ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                        : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                    }`}
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                      }`}
                    >
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                        theme === "light"
                          ? "bg-[#faf7f2] border border-[#e8ddd0] text-[#3d2b1f]"
                          : "bg-[#2d241d] border border-[#362b22] text-[#f5ede0]"
                      }`}
                      placeholder="Введите имя"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                      }`}
                    >
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                        theme === "light"
                          ? "bg-[#faf7f2] border border-[#e8ddd0] text-[#3d2b1f]"
                          : "bg-[#2d241d] border border-[#362b22] text-[#f5ede0]"
                      }`}
                      placeholder="Введите фамилию"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-[#c4a87a] text-[#3d2b1f] hover:bg-[#d4b896]"
                          : "bg-[#4a3b2e] text-[#f5ede0] hover:bg-[#5c4a3a]"
                      }`}
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
                      className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-[#f0e9df] text-[#6b4c3a] hover:bg-[#e8ddd0]"
                          : "bg-[#362b22] text-[#d4c5b5] hover:bg-[#4a3b2e]"
                      }`}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`flex items-center py-2 border-b ${
                      theme === "light"
                        ? "border-[#e8ddd0]"
                        : "border-[#362b22]"
                    }`}
                  >
                    <span
                      className={`w-24 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                    >
                      Имя:
                    </span>
                    <span
                      className={
                        theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                      }
                    >
                      {profile.first_name || "—"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center py-2 border-b ${
                      theme === "light"
                        ? "border-[#e8ddd0]"
                        : "border-[#362b22]"
                    }`}
                  >
                    <span
                      className={`w-24 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                    >
                      Фамилия:
                    </span>
                    <span
                      className={
                        theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                      }
                    >
                      {profile.last_name || "—"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center py-2 border-b ${
                      theme === "light"
                        ? "border-[#e8ddd0]"
                        : "border-[#362b22]"
                    }`}
                  >
                    <span
                      className={`w-24 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                    >
                      Email:
                    </span>
                    <span
                      className={
                        theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                      }
                    >
                      {profile.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Card */}
            <div
              className={`rounded-2xl p-6 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-[#e8ddd0] shadow-sm"
                  : "bg-[#241d17] border border-[#362b22] shadow-lg"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className={`text-xl font-bold flex items-center gap-2 ${
                    theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                  }`}
                >
                  Безопасность
                </h2>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      theme === "light"
                        ? "bg-[#d4b896] text-[#3d2b1f] hover:bg-[#c4a87a]"
                        : "bg-[#5c4a3a] text-[#f5ede0] hover:bg-[#4a3b2e]"
                    }`}
                  >
                    Сменить пароль
                  </button>
                )}
              </div>

              {changingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                      }`}
                    >
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
                      className={`w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                        theme === "light"
                          ? "bg-[#faf7f2] border border-[#e8ddd0] text-[#3d2b1f]"
                          : "bg-[#2d241d] border border-[#362b22] text-[#f5ede0]"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                      }`}
                    >
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
                      className={`w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                        theme === "light"
                          ? "bg-[#faf7f2] border border-[#e8ddd0] text-[#3d2b1f]"
                          : "bg-[#2d241d] border border-[#362b22] text-[#f5ede0]"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                      }`}
                    >
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
                      className={`w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a] ${
                        theme === "light"
                          ? "bg-[#faf7f2] border border-[#e8ddd0] text-[#3d2b1f]"
                          : "bg-[#2d241d] border border-[#362b22] text-[#f5ede0]"
                      }`}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-[#c4a87a] text-[#3d2b1f] hover:bg-[#d4b896]"
                          : "bg-[#4a3b2e] text-[#f5ede0] hover:bg-[#5c4a3a]"
                      }`}
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
                      className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-[#f0e9df] text-[#6b4c3a] hover:bg-[#e8ddd0]"
                          : "bg-[#362b22] text-[#d4c5b5] hover:bg-[#4a3b2e]"
                      }`}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`text-center py-4 text-sm ${
                    theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                  }`}
                >
                  Пароль можно изменить в любой момент
                </div>
              )}
            </div>

            {/* History Card */}
            <div
              className={`rounded-2xl p-6 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-[#e8ddd0] shadow-sm"
                  : "bg-[#241d17] border border-[#362b22] shadow-lg"
              }`}
            >
              <h2
                className={`text-xl font-bold flex items-center gap-2 mb-4 ${
                  theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                }`}
              >
                История прохождений
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-[#c4a87a] border-t-transparent rounded-full animate-spin"></div>
                  <p
                    className={`mt-2 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
                  >
                    Загрузка...
                  </p>
                </div>
              ) : attempts.length === 0 ? (
                <div
                  className={`text-center py-8 text-sm ${
                    theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"
                  }`}
                >
                  Вы ещё не прошли ни одного теста
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b ${
                          theme === "light"
                            ? "border-[#e8ddd0]"
                            : "border-[#362b22]"
                        }`}
                      >
                        <th
                          className={`text-left py-2 text-sm font-semibold ${
                            theme === "light"
                              ? "text-[#6b4c3a]"
                              : "text-[#d4c5b5]"
                          }`}
                        >
                          Дата
                        </th>
                        <th
                          className={`text-left py-2 text-sm font-semibold ${
                            theme === "light"
                              ? "text-[#6b4c3a]"
                              : "text-[#d4c5b5]"
                          }`}
                        >
                          Тест
                        </th>
                        <th
                          className={`text-left py-2 text-sm font-semibold ${
                            theme === "light"
                              ? "text-[#6b4c3a]"
                              : "text-[#d4c5b5]"
                          }`}
                        >
                          Результат
                        </th>
                        <th
                          className={`text-left py-2 text-sm font-semibold ${
                            theme === "light"
                              ? "text-[#6b4c3a]"
                              : "text-[#d4c5b5]"
                          }`}
                        >
                          Статус
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((attempt) => (
                        <tr
                          key={attempt.id}
                          className={`border-b transition-colors ${
                            theme === "light"
                              ? "border-[#e8ddd0] hover:bg-[#faf7f2]"
                              : "border-[#362b22] hover:bg-[#2d241d]"
                          }`}
                        >
                          <td
                            className={`py-2 text-sm ${
                              theme === "light"
                                ? "text-[#6b4c3a]"
                                : "text-[#d4c5b5]"
                            }`}
                          >
                            {new Date(attempt.started_at).toLocaleDateString()}
                          </td>
                          <td
                            className={`py-2 ${
                              theme === "light"
                                ? "text-[#3d2b1f]"
                                : "text-[#f5ede0]"
                            }`}
                          >
                            {attempt.quiz_title}
                          </td>
                          <td
                            className={`py-2 font-semibold ${
                              theme === "light"
                                ? "text-[#3d2b1f]"
                                : "text-[#f5ede0]"
                            }`}
                          >
                            {attempt.score_percent}%
                          </td>
                          <td className="py-2">
                            {attempt.passed ? (
                              <span className="text-green-600 dark:text-green-400 text-sm">
                                Сдано
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 text-sm">
                                Не сдано
                              </span>
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
