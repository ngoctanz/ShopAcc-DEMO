import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { authValidation } from "../validations/auth.validation.js";
import { authLimiter } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

// Rate limited auth endpoints
router.post(
  "/register",
  authLimiter, // 5 attempts per 15 min
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  "/login",
  authLimiter, // 5 attempts per 15 min
  validateRequest(authValidation.login),
  authController.login
);

router.post("/logout", authController.logout);

router.post("/refresh", authController.refreshToken);

router.get("/me", authenticate, authController.getCurrentUser);

router.post(
  "/change-password",
  authenticate,
  authLimiter,
  validateRequest(authValidation.changePassword),
  authController.changePassword
);

router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  "/verify-otp",
  authLimiter,
  validateRequest(authValidation.verifyOtp),
  authController.verifyOtp
);

router.post(
  "/reset-password",
  authLimiter,
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

export default router;
