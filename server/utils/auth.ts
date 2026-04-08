import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

// Загружаем переменные окружения с fallback значениями
const JWT_SECRET = process.env.JWT_SECRET || "my_fallback_jwt_secret_12345";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  process.env.SESSION_SECRET ||
  "my_fallback_refresh_secret_67890";

const generateAccessToken = (user: IUser): string => {
  const payload = {
    sub: user._id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (user: IUser): string => {
  const payload = {
    sub: user._id,
  };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

export { generateAccessToken, generateRefreshToken };
