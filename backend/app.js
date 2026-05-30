import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routs/authRoutes.js";
import tourRoutes from "./routs/tourRoutes.js";
import bookingRoutes from "./routs/bookingRoutes.js";
import reviewRoutes from "./routs/reviewRoutes.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

app.use("/api/tours", tourRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/reviews", reviewRoutes);

export default app;