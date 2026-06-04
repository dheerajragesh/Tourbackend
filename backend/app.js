import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routs/authRoutes.js";
import tourRoutes from "./routs/tourRoutes.js";
import paymentRoutes from "./routs/paymentRoutes.js";
import bookingRoutes from "./routs/bookingRoutes.js";
import reviewRoutes from "./routs/reviewRoutes.js";
import dotenv from "dotenv";

dotenv.config();  

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

app.use("/api/payments", paymentRoutes);

export default app;