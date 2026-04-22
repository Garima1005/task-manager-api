"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTask = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// ➕ CREATE TASK
const createTask = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title required" });
        }
        const task = await prisma_1.default.task.create({
            data: {
                title,
                userId: req.user.userId,
            },
        });
        res.status(201).json(task);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.createTask = createTask;
// 📋 GET TASKS (pagination + filter + search)
const getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 5, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const tasks = await prisma_1.default.task.findMany({
            where: {
                userId: req.user.userId,
                ...(status !== undefined && {
                    completed: status === "true",
                }),
                ...(search && {
                    title: {
                        contains: search,
                    },
                }),
            },
            skip,
            take: Number(limit),
            orderBy: {
                id: "desc",
            },
        });
        res.json(tasks);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getTasks = getTasks;
// 🔍 GET SINGLE TASK
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.default.task.findFirst({
            where: {
                id: Number(id),
                userId: req.user.userId,
            },
        });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(task);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getTaskById = getTaskById;
// ✏️ UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const task = await prisma_1.default.task.updateMany({
            where: {
                id: Number(id),
                userId: req.user.userId,
            },
            data: {
                title,
                completed,
            },
        });
        res.json({ message: "Task updated", task });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateTask = updateTask;
// ❌ DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.task.deleteMany({
            where: {
                id: Number(id),
                userId: req.user.userId,
            },
        });
        res.json({ message: "Task deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteTask = deleteTask;
// 🔁 TOGGLE TASK
const toggleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.default.task.findFirst({
            where: {
                id: Number(id),
                userId: req.user.userId,
            },
        });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        const updated = await prisma_1.default.task.update({
            where: { id: task.id },
            data: {
                completed: !task.completed,
            },
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
};
exports.toggleTask = toggleTask;
