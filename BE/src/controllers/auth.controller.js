import { authService } from "../services/auth.service.js";
import { responseUtils } from "../utils/response.util.js";
import { cookieUtils } from "../utils/cookie.util.js";
import { auditService } from "../services/audit.service.js";
import { tokenBlacklistService } from "../services/token-blacklist.service.js";

export const authController = {
  async register(req, res, next) {
    try {
      const { user, tokens } = await authService.register(req.body);

      // Set both tokens in cookies
      cookieUtils.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
      await auditService.logRegister(req, user._id);

      return responseUtils.success(
        res,
        {
          user,
          accessToken: tokens.accessToken,
        },
        "Registration successful",
        201
      );
    } catch (error) {
      if (error.message === "Email already exists") {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await authService.login(email, password);

      // Set both tokens in cookies
      cookieUtils.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
      return responseUtils.success(res, {
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      if (error.message === "Invalid credentials") {
        return responseUtils.unauthorized(res, "Invalid email or password");
      }
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = cookieUtils.getRefreshTokenFromCookie(req);
      const accessToken =
        cookieUtils.getAccessTokenFromCookie(req) || req.accessToken;

      if (accessToken && req.user) {
        await tokenBlacklistService.blacklistToken(
          accessToken,
          req.user.userId,
          "logout"
        );
      }

      await authService.logout(refreshToken);

      // Clear all auth cookies
      cookieUtils.clearAuthCookies(res);
      return responseUtils.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const oldRefreshToken = cookieUtils.getRefreshTokenFromCookie(req);

      if (!oldRefreshToken) {
        // No refresh token in cookie - clear everything
        cookieUtils.clearAuthCookies(res);
        return responseUtils.unauthorized(res, "Refresh token not found");
      }

      const { user, tokens } = await authService.refreshToken(oldRefreshToken);

      // Set new tokens in cookies
      cookieUtils.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
      // Token refresh không cần log nữa

      return responseUtils.success(res, {
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      // Only clear cookies for token-related errors (invalid/expired)
      // Don't clear for DB errors, network issues, etc.
      const isTokenError = error.message?.includes("token") || 
                           error.message?.includes("expired") ||
                           error.message?.includes("Invalid");
      
      if (isTokenError) {
        cookieUtils.clearAuthCookies(res);
      }
      
      return responseUtils.unauthorized(
        res,
        isTokenError ? "Invalid or expired refresh token" : "Refresh failed, please try again"
      );
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      return responseUtils.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;

      await authService.changePassword(userId, oldPassword, newPassword);

      await auditService.logPasswordChange(req);

      return responseUtils.success(res, null, "Đổi mật khẩu thành công");
    } catch (error) {
      if (error.message === "Mật khẩu hiện tại không chính xác") {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },


  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return responseUtils.success(
        res,
        null,
        "Mã OTP đã được gửi đến email của bạn"
      );
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      await authService.verifyOtp(email, otp);
      return responseUtils.success(res, null, "Xác thực OTP thành công");
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      await authService.resetPassword(email, otp, newPassword);
      return responseUtils.success(res, null, "Đặt lại mật khẩu thành công");
    } catch (error) {
      next(error);
    }
  },
};
