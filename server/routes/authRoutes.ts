import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as userService from "../services/userService";
import { requireAuth } from "./middlewares/auth";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await userService.createUser({ email, password, role });
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, async (req: any, res) => {
  res.json(req.user);
});

export default router;
