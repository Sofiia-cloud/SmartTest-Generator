import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../services/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await auth.register({
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
      });

      const { token, user } = response.data;
      login(token, user);

      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === "light" ? "bg-[#faf7f2]" : "bg-[#1a1410]"
      }`}
    >
      <div
        className={`relative w-96 p-8 rounded-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          theme === "light"
            ? "bg-white border border-[#e8ddd0] shadow-xl"
            : "bg-[#241d17] border border-[#362b22] shadow-xl"
        }`}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                  : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
            }}
          >
            <span className="text-2xl">☕</span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #6b4c3a 0%, #3d2b1f 100%)"
                  : "linear-gradient(135deg, #d4c5b5 0%, #f5ede0 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Создание аккаунта
          </h1>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm text-center"
            style={{
              background: theme === "light" ? "#f0e9df" : "#362b22",
              color: theme === "light" ? "#8b5a4a" : "#c4a87a",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя (необязательно)"
              className="w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
            />
          </div>

          <div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия (необязательно)"
              className="w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтверждение пароля"
              className="w-full px-4 py-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"}`}
            >
              Ваша роль
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 px-4 rounded-xl font-medium transition ${
                  role === "student"
                    ? "bg-[#d4b896] text-[#3d2b1f] shadow-md"
                    : theme === "light"
                      ? "bg-[#f0e9df] text-[#6b4c3a] hover:bg-[#e8ddd0]"
                      : "bg-[#362b22] text-[#d4c5b5] hover:bg-[#4a3b2e]"
                }`}
              >
                📚 Ученик
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-2 px-4 rounded-xl font-medium transition ${
                  role === "admin"
                    ? "bg-[#d4b896] text-[#3d2b1f] shadow-md"
                    : theme === "light"
                      ? "bg-[#f0e9df] text-[#6b4c3a] hover:bg-[#e8ddd0]"
                      : "bg-[#362b22] text-[#d4c5b5] hover:bg-[#4a3b2e]"
                }`}
              >
                👨‍💼 Админ
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                  : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
              color: theme === "light" ? "#3d2b1f" : "#f5ede0",
            }}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p
          className={`text-center mt-4 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
        >
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="text-[#c4a87a] hover:text-[#d4b896] font-medium transition"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
