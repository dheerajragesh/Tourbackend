import Tour from "../models/Tour.js";

const canMutateTour = (req, tour) => {
  if (!req.user || !tour) return false;
  if (req.user.role === "admin") return true;
  if (req.user.role === "operator") {
    return tour.operator?.toString() === req.user._id?.toString();
  }
  return false;
};

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

export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    if (!canMutateTour(req, tour)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    // prevent changing operator via payload
    const { operator, ...rest } = req.body || {};

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { ...rest },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Tour updated successfully",
      tour: updatedTour,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    if (!canMutateTour(req, tour)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    await tour.deleteOne();

    res.status(200).json({
      message: "Tour deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
