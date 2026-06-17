import express from "express";

import {
  getTours,
  getSingleTour,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getTours);

router.get("/:id", getSingleTour);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  createTour
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  updateTour
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("operator", "admin"),
  deleteTour
);

export default router;
