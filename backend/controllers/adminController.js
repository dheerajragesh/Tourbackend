// controllers/adminController.js

import User from "../models/User.js";
import Tour from "../models/Tour.js";


// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete Operator + All Tours
export const deleteOperator = async (
  req,
  res
) => {
  try {
    const operator = await User.findById(
      req.params.id
    );

    if (!operator) {
      return res.status(404).json({
        message: "Operator not found",
      });
    }

    if (operator.role !== "operator") {
      return res.status(400).json({
        message: "This user is not an operator",
      });
    }

    await Tour.deleteMany({
      operator: operator._id,
    });

    await operator.deleteOne();

    res.status(200).json({
      message:
        "Operator and all related tours deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete Tour
export const deleteTour = async (
  req,
  res
) => {
  try {
    const tour = await Tour.findById(
      req.params.id
    );

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
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