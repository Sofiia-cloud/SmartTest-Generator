import React from "react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden"
      style={{
        background:
          theme === "light"
            ? "linear-gradient(135deg, #d4b896 0%, #c4a87a 100%)"
            : "linear-gradient(135deg, #4a3b2e 0%, #362b22 100%)",
      }}
    >
      <span
        className={`inline-block h-7 w-7 transform rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
          theme === "light"
            ? "translate-x-1 bg-[#faf7f2]"
            : "translate-x-8 bg-[#2d241d]"
        }`}
      >
        {theme === "light" ? (
          <svg
            className="h-4 w-4 text-[#6b4c3a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-[#c4a87a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
