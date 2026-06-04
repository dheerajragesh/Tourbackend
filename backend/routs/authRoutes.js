import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateRole,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", authMiddleware, getMe);

router.post("/role", authMiddleware, updateRole);

export default router;
