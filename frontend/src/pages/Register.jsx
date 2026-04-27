import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../services/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' или 'admin'
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
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
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Перенаправление в зависимости от роли
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">SmartTest</h1>
          <p className="text-gray-400 mt-2">Создание аккаунта</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Введите имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Введите фамилию"
              />
            </div>

            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition"
              placeholder="минимум 6 символов"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Подтверждение пароля
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ваша роль</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  role === "student"
                    ? "bg-purple-600 text-white ring-2 ring-purple-400"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Ученик</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  role === "admin"
                    ? "bg-purple-600 text-white ring-2 ring-purple-400"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Админ</span>
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {role === "admin"
                ? "Администратор может создавать тесты и управлять документами"
                : "Ученик может проходить тесты и отслеживать прогресс"}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
