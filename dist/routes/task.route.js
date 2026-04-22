"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/task.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const task_controller_1 = require("../controllers/task.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authMiddleware, task_controller_1.createTask);
router.get("/", auth_middleware_1.authMiddleware, task_controller_1.getTasks);
router.get("/:id", auth_middleware_1.authMiddleware, task_controller_1.getTaskById);
router.patch("/:id", auth_middleware_1.authMiddleware, task_controller_1.updateTask);
router.delete("/:id", auth_middleware_1.authMiddleware, task_controller_1.deleteTask);
router.patch("/:id/toggle", auth_middleware_1.authMiddleware, task_controller_1.toggleTask);
exports.default = router;
