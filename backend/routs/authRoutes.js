import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateRole,
  forgotPassword,
  resetPassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/authController.js";


import authMiddleware from "../middleware/authMiddleware.js";
import {
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validateAuth.js";
import {
  wishlistAddValidation,
  wishlistRemoveValidation,
  handleValidationErrors,
} from "../middleware/validateWishlist.js";

const router = express.Router();

router.post("/register", registerUser);


router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", authMiddleware, getMe);

router.post("/role", authMiddleware, updateRole);

// Forgot password
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword
);

// Wishlist
router.get("/wishlist", authMiddleware, getWishlist);
router.post(
  "/wishlist",
  authMiddleware,
  wishlistAddValidation,
  handleValidationErrors,
  addToWishlist
);
router.delete(
  "/wishlist",
  authMiddleware,
  wishlistRemoveValidation,
  handleValidationErrors,
  removeFromWishlist
);

export default router;

