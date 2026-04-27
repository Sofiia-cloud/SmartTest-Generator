import React from "react";
import { useTheme } from "../context/ThemeContext";

function Card({
  children,
  className = "",
  hover = true,
  onClick,
  variant = "default",
}) {
  const { theme } = useTheme();

  const variants = {
    default:
      theme === "light"
        ? "bg-white border border-[#e8ddd0] shadow-sm"
        : "bg-[#241d17] border border-[#362b22]",
    elevated:
      theme === "light"
        ? "bg-white border border-[#e8ddd0] shadow-md"
        : "bg-[#241d17] border border-[#362b22] shadow-lg",
    glass: theme === "light" ? "glass-light" : "glass-dark",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 ${
        variants[variant]
      } ${hover && !onClick ? "hover:-translate-y-1 hover:shadow-lg" : ""} ${
        onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
