import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },

    bookingDate: String,

    travelers: Number,

    specialRequests: String,

    totalPrice: Number,

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;