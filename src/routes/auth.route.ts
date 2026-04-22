// src/routes/auth.routes.ts
import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshTokenHandler,
  logoutUser,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logoutUser);

export default router;