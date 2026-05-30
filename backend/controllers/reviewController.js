import Review from "../models/Review.js";
import Tour from "../models/Tour.js";

export const addReview = async (req, res) => {
  try {
    const { tourId, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user._id,
      tour: tourId,
      rating,
      comment,
    });

    await Tour.findByIdAndUpdate(tourId, {
      $push: {
        reviews: review._id,
      },
    });

    res.status(201).json({
      message: "Review Added",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};