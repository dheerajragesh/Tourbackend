import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

export const createBooking = async (req, res) => {
  try {
    const {
      tourId,
      bookingDate,
      travelers,
      specialRequests,
    } = req.body;

    const tour = await Tour.findById(tourId);

    const booking = await Booking.create({
      user: req.user._id,
      tour: tourId,
      bookingDate,
      travelers,
      specialRequests,
      totalPrice: tour.price * travelers,
    });

    res.status(201).json({
      message: "Booking Created",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    }).populate("tour");

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};