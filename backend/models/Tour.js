import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    images: [String],

    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    availability: [
      {
        date: String,
        slots: Number,
        bookedSeats: {
          type: Number,
          default: 0,
        },
      },
    ],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;