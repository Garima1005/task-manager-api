// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        refreshToken: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({ accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ error: "No token provided" });

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        refreshToken: true,
      },
    });

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ error: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(user.id);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const { userId } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  res.json({ message: "Logged out successfully" });
};
