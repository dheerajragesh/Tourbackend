import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "operator", "admin"],
      default: "user",
    },

    avatar: {
      type: String,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],

    // Forgot password
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;