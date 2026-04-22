// src/controllers/task.controller.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

// ➕ CREATE TASK
export const createTask = async (req: any, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId: req.user.userId,
      },
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 📋 GET TASKS (pagination + filter + search)
export const getTasks = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 5, status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await prisma.task.findMany({
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
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔍 GET SINGLE TASK
export const getTaskById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// ✏️ UPDATE TASK
export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const task = await prisma.task.updateMany({
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
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// ❌ DELETE TASK
export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.task.deleteMany({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    });

    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔁 TOGGLE TASK
export const toggleTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        completed: !task.completed,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};