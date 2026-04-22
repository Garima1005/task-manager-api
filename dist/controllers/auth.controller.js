"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshTokenHandler = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const token_1 = require("../utils/token");
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }
        const existing = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existing) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                refreshToken: true,
            },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });
        const accessToken = (0, token_1.generateAccessToken)(user.id);
        const refreshToken = (0, token_1.generateRefreshToken)(user.id);
        // save refresh token
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        res.json({ accessToken, refreshToken });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.loginUser = loginUser;
const refreshTokenHandler = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(401).json({ error: "No token provided" });
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                refreshToken: true,
            },
        });
        if (!user || user.refreshToken !== refreshToken)
            return res.status(403).json({ error: "Invalid refresh token" });
        const newAccessToken = (0, token_1.generateAccessToken)(user.id);
        res.json({ accessToken: newAccessToken });
    }
    catch {
        res.status(403).json({ error: "Invalid token" });
    }
};
exports.refreshTokenHandler = refreshTokenHandler;
const logoutUser = async (req, res) => {
    const { userId } = req.body;
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
    res.json({ message: "Logged out successfully" });
};
exports.logoutUser = logoutUser;
