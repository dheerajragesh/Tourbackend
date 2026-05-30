import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateTocken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration Successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Login Successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged Out",
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};