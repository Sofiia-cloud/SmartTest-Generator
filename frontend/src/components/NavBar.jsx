import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { label: "Главная", path: "/", icon: "🏠" },
    { label: "Профиль", path: "/profile", icon: "👤" },
    ...(user?.role === "admin"
      ? [{ label: "Админ-панель", path: "/admin", icon: "⚙️" }]
      : []),
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        theme === "light"
          ? "bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#e8ddd0] shadow-sm"
          : "bg-[#1a1410]/90 backdrop-blur-md border-b border-[#362b22]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-md"
              style={{
                background:
                  theme === "light"
                    ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                    : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
              }}
            >
              <span className="text-white text-xl">☕</span>
            </div>
            <div>
              <span
                className={`text-xl font-bold tracking-tight transition-colors ${
                  theme === "light" ? "text-[#3d2b1f]" : "text-[#f5ede0]"
                }`}
              >
                SmartTest
              </span>
              <span
                className={`text-xs ml-1 ${theme === "light" ? "text-[#a88b74]" : "text-[#6b4c3a]"}`}
              >
                by AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                  theme === "light"
                    ? "text-[#6b4c3a] hover:bg-[#f0e9df] hover:text-[#3d2b1f]"
                    : "text-[#d4c5b5] hover:bg-[#362b22] hover:text-[#f5ede0]"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </button>
            ))}

            <div className="ml-4 flex items-center space-x-3">
              <ThemeToggle />

              <div
                className={`h-6 w-px ${theme === "light" ? "bg-[#e8ddd0]" : "bg-[#362b22]"}`}
              />

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        theme === "light"
                          ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
                          : "linear-gradient(135deg, #5c4a3a 0%, #4a3b2e 100%)",
                    }}
                  >
                    <span className="text-white text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                    }`}
                  >
                    {user?.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center space-x-1 ${
                    theme === "light"
                      ? "bg-[#f0e9df] text-[#8b5a4a] hover:bg-[#e8ddd0]"
                      : "bg-[#362b22] text-[#c4a87a] hover:bg-[#4a3b2e]"
                  }`}
                >
                  <span>🚪</span>
                  <span className="text-sm">Выйти</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t transition-colors duration-300 ${
            theme === "light"
              ? "border-[#e8ddd0] bg-[#faf7f2]"
              : "border-[#362b22] bg-[#1a1410]"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                  theme === "light"
                    ? "text-[#6b4c3a] hover:bg-[#f0e9df]"
                    : "text-[#d4c5b5] hover:bg-[#362b22]"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <span
                  className={
                    theme === "light" ? "text-[#6b4c3a]" : "text-[#d4c5b5]"
                  }
                >
                  Тема
                </span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl flex items-center space-x-3 text-[#c4a87a] hover:bg-[#362b22]"
              >
                <span>🚪</span>
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
