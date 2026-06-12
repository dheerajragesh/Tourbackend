import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createBooking,
  getMyBookings,
  getOperatorBookings,
  cancelBooking,
  updateBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

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

router.get(
  "/operator",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  getOperatorBookings
);

router.patch(
  "/status/:id",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  updateBookingStatus
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  updateBookingStatus
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
