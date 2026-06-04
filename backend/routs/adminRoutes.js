// routes/adminRoutes.js

import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getAllUsers,
  deleteUser,
  deleteOperator,
  deleteTour,
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

router.delete(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

router.delete(
  "/operator/:id",
  authMiddleware,
  adminMiddleware,
  deleteOperator
);

router.delete(
  "/tour/:id",
  authMiddleware,
  adminMiddleware,
  deleteTour
);

export default router;