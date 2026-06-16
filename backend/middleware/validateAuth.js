import { body } from "express-validator";

export const forgotPasswordValidation = [
  body("email")
    .exists()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email"),
];

export const resetPasswordValidation = [
  body("token")
    .exists()
    .withMessage("token is required")
    .bail()
    .isString()
    .withMessage("token must be a string"),
  body("newPassword")
    .exists()
    .withMessage("newPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters"),
];

