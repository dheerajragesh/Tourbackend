import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  createBooking
);

router.get(
  "/my-bookings",
  authMiddleware,
  getMyBookings
);

router.delete(
  "/cancel/:id",
  authMiddleware,
  cancelBooking
);

router.put(
  "/:id",
  authMiddleware,
  updateBooking
);

router.patch(
  "/:id",
  authMiddleware,
  updateBooking
);


export default router;