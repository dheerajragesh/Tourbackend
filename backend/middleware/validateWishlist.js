import { body, validationResult } from "express-validator";

export const wishlistAddValidation = [
  body("tourId")
    .exists()
    .withMessage("tourId is required")
    .bail()
    .isMongoId()
    .withMessage("tourId must be a valid MongoId"),
];

export const wishlistRemoveValidation = [
  body("tourId")
    .exists()
    .withMessage("tourId is required")
    .bail()
    .isMongoId()
    .withMessage("tourId must be a valid MongoId"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });
};

