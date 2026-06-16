import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateTocken.js";
import sendEmail from "../utils/sendEmail.js";
import emailTemplates from "../utils/emailTemplates.js";

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

    // Send Welcome Email (Handlebars template)
    await sendEmail({
      to: user.email,
      subject: "Welcome to Tour Booking",
      template: emailTemplates.welcome_mail,
      context: {
        name: user.name,
        websiteLink: process.env.FRONTEND_URL || "http://localhost:3000",
      },
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

    // Send Login Alert Email (Handlebars template)
    await sendEmail({
      to: user.email,
      subject: "Login Alert",
      template: emailTemplates.login_alert,
      context: {
        name: user.name,
        loginTime: new Date().toLocaleString(),
        device: req.headers["user-agent"] || "Unknown",
        location: "Unknown",
      },
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

export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        message: "Role is required",
      });
    }

    const allowedRoles = [
      "user",
      "operator",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user._id,
        { role },
        { new: true }
      ).select("-password");

    // Send Role Change Email (still raw HTML; template not provided yet)
    await sendEmail(
      updatedUser.email,
      "Role Updated",
      `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${updatedUser.name}</h2>

        <p>
          Your account role has been updated.
        </p>

        <p>
          New Role:
          <strong>${updatedUser.role}</strong>
        </p>

        <br>

        <p>
          Tour Booking Team
        </p>
      </div>
      `
    );

    return res.status(200).json({
      message: "Role updated",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =============================
// Forgot Password
// =============================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Avoid leaking whether user exists
    if (!user) {
      return res
        .status(200)
        .json({ message: "If the account exists, an email has been sent" });
    }

    // Simple token (JWT-like) using existing JWT secret so no new deps
    const resetToken = generateToken(user._id);
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      template: emailTemplates.password_reset,
      context: {
        name: user.name,
        resetLink,
      },
    });

    return res
      .status(200)
      .json({ message: "Password reset email sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and newPassword are required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (
      !user ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid or expired token" });
  }
};

// =============================
// Wishlist
// =============================

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    return res.status(200).json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ message: "tourId is required" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: tourId } },
      { new: true }
    );

    return res.status(200).json({ message: "Added to wishlist" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ message: "tourId is required" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: tourId } },
      { new: true }
    );

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
