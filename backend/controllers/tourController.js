import Tour from "../models/Tour.js";

export const getTours = async (req, res) => {
  try {
    const tours = await Tour.find()
      .populate("operator", "name")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name",
        },
      });

    res.status(200).json({
      tours,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSingleTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("operator", "name")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name",
        },
      });

    res.status(200).json({
      tour,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createTour = async (req, res) => {
  try {
    const tour = await Tour.create({
      ...req.body,
      operator: req.user._id,
    });

    res.status(201).json({
      message: "Tour Created",
      tour,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};