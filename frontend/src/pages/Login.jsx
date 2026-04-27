import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await auth.login({ email, password });
      const { token, user } = response.data;
      login(token, user);

      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка входа");
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
        className={`relative w-96 p-8 rounded-2xl transition-all duration-300 ${
          theme === "light"
            ? "bg-white border border-[#e8ddd0] shadow-xl"
            : "bg-[#241d17] border border-[#362b22] shadow-xl"
        }`}
      >
        {/* Decorative coffee steam */}
        <div className="absolute -top-1 right-1/2 transform translate-x-1/2">
          <div className="flex space-x-1 opacity-30">
            <div className="w-0.5 h-4 bg-[#c4a87a] rounded-full animate-pulse"></div>
            <div className="w-0.5 h-6 bg-[#c4a87a] rounded-full animate-pulse delay-100"></div>
            <div className="w-0.5 h-3 bg-[#c4a87a] rounded-full animate-pulse delay-200"></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                  : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
            }}
          >
            <span className="text-3xl">☕</span>
          </div>
          <h1
            className="text-3xl font-bold"
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
            SmartTest
          </h1>
          <p
            className={`mt-2 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
          >
            Добро пожаловать в мир знаний
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
              required
              autoFocus
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#c4a87a]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                  : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
              color: theme === "light" ? "#3d2b1f" : "#f5ede0",
            }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p
          className={`text-center mt-6 text-sm ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
        >
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="text-[#c4a87a] hover:text-[#d4b896] font-medium transition"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
