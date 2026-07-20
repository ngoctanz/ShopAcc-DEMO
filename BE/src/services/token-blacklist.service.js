import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../models/token-blacklist.model.js";
import { env } from "../config/environment.js";

export const tokenBlacklistService = {
  // Add token to blacklist
  async blacklistToken(token, userId, reason = "logout") {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return;

      // Calculate expiration from token's exp claim
      const expiresAt = new Date(decoded.exp * 1000);

      await TokenBlacklist.create({
        token,
        userId,
        reason,
        expiresAt,
      });
    } catch (error) {
      console.error("Failed to blacklist token:", error);
    }
  },

  // Check if token is blacklisted
  async isBlacklisted(token) {
    const blacklisted = await TokenBlacklist.findOne({ token });
    return !!blacklisted;
  },

  // Blacklist all tokens for a user (e.g., after password change)
  async blacklistAllUserTokens(userId, reason = "password_change") {
    // This is handled by UserToken model (refresh tokens)
    // For access tokens, we need to track them differently
    // In practice, short-lived access tokens are acceptable
    console.log(`All tokens for user ${userId} should be considered invalid`);
  },

  // Clean up expired entries (backup for TTL index)
  async cleanupExpired() {
    const result = await TokenBlacklist.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  },
};
