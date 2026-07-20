/**
 * Authentication & Authorization Middlewares
 */
import { jwtUtils } from "../utils/jwt.util.js";
import { responseUtils } from "../utils/response.util.js";
import { cookieUtils } from "../utils/cookie.util.js";
import { User } from "../models/user.model.js";
import { tokenBlacklistService } from "../services/token-blacklist.service.js";
import { auditService } from "../services/audit.service.js";

/**
 * Extract token from request (cookie first, then header)
 */
const extractToken = (req) => {
  // Try to get from cookie first
  const cookieToken = cookieUtils.getAccessTokenFromCookie(req);
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/**
 * Authenticate user by JWT token (from cookie or header)
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return responseUtils.unauthorized(res, "No token provided");
    }

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      await auditService.logSuspiciousActivity(req, "Attempted use of blacklisted token");
      return responseUtils.unauthorized(res, "Token has been revoked");
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return responseUtils.unauthorized(res, "User not found");
    }

    if (user.status === "banned") {
      await auditService.logSuspiciousActivity(req, "Banned user attempted access", { userId: user._id });
      return responseUtils.forbidden(res, "Account has been banned");
    }

    if (user.status !== "active") {
      return responseUtils.forbidden(res, "Account is not active");
    }

    req.accessToken = token;
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.message.includes("token")) {
      return responseUtils.unauthorized(res, error.message);
    }
    return responseUtils.error(res, "Authentication failed", 500);
  }
};

/**
 * Optional authentication - sets user if token present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      return next();
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (user && user.status === "active") {
      req.accessToken = token;
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    }

    next();
  } catch (error) {
    // Token invalid, continue without user
    next();
  }
};

/**
 * Require specific role(s)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseUtils.unauthorized(res, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return responseUtils.forbidden(res, "Insufficient permissions");
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole("admin");
