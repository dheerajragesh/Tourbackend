import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const {
      tourId,
      bookingDate,
      travelers,
      specialRequests,
    } = req.body;

    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      tour: tourId,
      bookingDate,
      travelers,
      specialRequests,
      totalPrice: tour.price * travelers,
    });

    const user = await User.findById(req.user._id);

    await sendEmail(
      user.email,
      "Tour Booking Confirmation",
      `
      <h2>Booking Confirmed 🎉</h2>
      <p>Hello ${user.name},</p>
      <p>Your booking has been confirmed.</p>

      <ul>
        <li><strong>Tour:</strong> ${tour.title}</li>
        <li><strong>Date:</strong> ${new Date(
          bookingDate
        ).toLocaleDateString()}</li>
        <li><strong>Travelers:</strong> ${travelers}</li>
        <li><strong>Total Price:</strong> $${
          tour.price * travelers
        }</li>
      </ul>

      <p>Have a wonderful trip ✈️</p>
      `
    );

    res.status(201).json({
      message: "Booking Created Successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Bookings
export const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("tour")
      .sort({ createdAt: -1 });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Booking
export const updateBooking = async (
  req,
  res
) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    ).populate("tour");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const {
      bookingDate,
      travelers,
      specialRequests,
    } = req.body;

    booking.bookingDate =
      bookingDate || booking.bookingDate;

    booking.travelers =
      travelers || booking.travelers;

    booking.specialRequests =
      specialRequests ??
      booking.specialRequests;

    booking.totalPrice =
      booking.tour.price * booking.travelers;

    await booking.save();

    const user = await User.findById(
      req.user._id
    );

    await sendEmail(
      user.email,
      "Booking Updated",
      `
      <h2>Booking Updated ✏️</h2>

      <p>Hello ${user.name},</p>

      <p>Your booking has been updated successfully.</p>

      <ul>
        <li><strong>Tour:</strong> ${
          booking.tour.title
        }</li>
        <li><strong>Date:</strong> ${new Date(
          booking.bookingDate
        ).toLocaleDateString()}</li>
        <li><strong>Travelers:</strong> ${
          booking.travelers
        }</li>
        <li><strong>Total Price:</strong> $${
          booking.totalPrice
        }</li>
      </ul>
      `
    );

    res.status(200).json({
      message: "Booking Updated Successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel Booking
export const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    ).populate("tour");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    await sendEmail(
      user.email,
      "Booking Cancelled",
      `
      <h2>Booking Cancelled ❌</h2>

      <p>Hello ${user.name},</p>

      <p>Your booking for
      <strong>${booking.tour.title}</strong>
      has been cancelled.</p>

      <p>We hope to see you again soon.</p>
      `
    );

    await booking.deleteOne();

    res.status(200).json({
      message: "Booking Cancelled Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};