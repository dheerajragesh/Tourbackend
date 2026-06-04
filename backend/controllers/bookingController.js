import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

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

    // Get user details
    const user = await User.findById(req.user._id);

    // Send Booking Confirmation Email
    await sendEmail(
      user.email,
      "Tour Booking Confirmation",
      `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Booking Confirmed 🎉</h2>

        <p>Hello <strong>${user.name}</strong>,</p>

        <p>Your booking has been successfully created.</p>

        <h3>Booking Details</h3>

        <table style="border-collapse: collapse;">
          <tr>
            <td><strong>Tour:</strong></td>
            <td>${tour.title}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td>${new Date(
              bookingDate
            ).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Travelers:</strong></td>
            <td>${travelers}</td>
          </tr>
          <tr>
            <td><strong>Total Price:</strong></td>
            <td>$${tour.price * travelers}</td>
          </tr>
        </table>

        ${
          specialRequests
            ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>`
            : ""
        }

        <br/>

        <p>Thank you for booking with us.</p>

        <p>Have a wonderful journey! ✈️</p>
      </div>
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
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Booking Cancelled ❌</h2>

        <p>Hello ${user.name},</p>

        <p>Your booking for <strong>${booking.tour.title}</strong> has been cancelled successfully.</p>

        <p>We hope to serve you again in the future.</p>
      </div>
      `
    );

    await booking.deleteOne();

    res.status(200).json({
      message: "Booking Cancelled",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};