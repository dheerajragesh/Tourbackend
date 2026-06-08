import bcrypt from "bcryptjs";
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