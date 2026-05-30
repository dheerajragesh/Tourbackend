import express from "express";

import {
  getTours,
  getSingleTour,
  createTour,
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

export default router;