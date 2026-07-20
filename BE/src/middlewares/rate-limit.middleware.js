import rateLimit from "express-rate-limit";
import { responseUtils } from "../utils/response.util.js";

export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    responseUtils.error(res, "Too many requests, please try again later", 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Only 5 attempts
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again after 5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    responseUtils.error(
      res,
      "Too many authentication attempts, please try again after 5 minutes",
      429
    );
  },
});

export const sensitiveOpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Only 3 attempts per hour
  message: {
    success: false,
    message: "Too many attempts for sensitive operation",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    responseUtils.error(res, "Too many attempts for sensitive operation", 429);
  },
});

export const purchaseLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 purchases per minute max
  message: {
    success: false,
    message: "Too many purchase attempts, please slow down",
  },
  handler: (req, res) => {
    responseUtils.error(
      res,
      "Too many purchase attempts, please slow down",
      429
    );
  },
});

// Admin credential viewing - more lenient for legitimate admin use
export const adminCredentialLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 50, // 50 credential views per 5 minutes
  message: {
    success: false,
    message: "Too many credential view attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    responseUtils.error(
      res,
      "Too many credential view attempts, please try again later",
      429
    );
  },
});

// Credential view rate limiter - prevent brute force on order IDs
export const credentialViewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 credential views per 5 minutes (supports bulk purchases up to 10 acc x 5 views)
  message: {
    success: false,
    message: "Quá nhiều yêu cầu xem thông tin, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    responseUtils.error(
      res,
      "Quá nhiều yêu cầu xem thông tin, vui lòng thử lại sau",
      429
    );
  },
});

// Balance update rate limiter - prevent spamming balance updates
export const balanceUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10,
  message: {
    success: false,
    message: "Bạn đang thực hiện cộng/trừ tiền quá nhanh, vui lòng thử lại sau 5 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    responseUtils.error(
      res,
      "Bạn đang thực hiện cộng/trừ tiền quá nhanh, vui lòng thử lại sau 5 phút",
      429
    );
  },
});
