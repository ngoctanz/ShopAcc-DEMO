import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";

export const jwtUtils = {
  generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  },

  getRefreshTokenExpirationDate() {
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  },
};
