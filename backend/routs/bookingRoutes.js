import express from "express";

import {
  createBooking,
  getMyBookings,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);

router.get("/my", authMiddleware, getMyBookings);

export default router;