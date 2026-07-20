import { User } from "../models/user.model.js";
import { UserToken } from "../models/user-token.model.js";
import { jwtUtils } from "../utils/jwt.util.js";
import { emailService } from "./email.service.js";

export const authService = {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const user = await User.create(userData);
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  },

  async login(email, password) {
    const user = await User.findByCredentials(email, password);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await UserToken.findOneAndUpdate(
        { refreshToken, isRevoked: false },
        { isRevoked: true }
      );
    }
  },

  async refreshToken(oldRefreshToken) {
    const decoded = jwtUtils.verifyRefreshToken(oldRefreshToken);

    const tokenDoc = await UserToken.findOne({
      refreshToken: oldRefreshToken,
      isRevoked: false,
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== "active") {
      throw new Error("User not found or inactive");
    }

    await UserToken.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  },

  async generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtUtils.generateAccessToken(payload);
    const refreshToken = jwtUtils.generateRefreshToken(payload);

    await UserToken.create({
      userId: user._id,
      refreshToken,
      expiresAt: jwtUtils.getRefreshTokenExpirationDate(),
    });

    return { accessToken, refreshToken };
  },

  async getCurrentUser(userId) {
    return await User.findById(userId);
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Mật khẩu hiện tại không chính xác");
    }

    user.password = newPassword;
    await user.save();
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await emailService.sendOtp(email, otp);
  },

  async verifyOtp(email, otp) {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: new Date() },
    }).select("+otp +otpExpires");

    if (!user) {
      throw new Error("Mã OTP không chính xác hoặc đã hết hạn");
    }

    return true;
  },

  async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: new Date() },
    }).select("+otp +otpExpires");

    if (!user) {
      throw new Error("Mã OTP không chính xác hoặc đã hết hạn");
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
  },
};
