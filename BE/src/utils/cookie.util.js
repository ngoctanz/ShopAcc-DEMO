import { env } from "../config/environment.js";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

export const cookieUtils = {
  /**
   * Set access token cookie
   */
  setAccessTokenCookie(res, token) {
    const isProduction = env.NODE_ENV === "production";

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax", // "none" for cross-site cookies
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });
  },

  /**
   * Set refresh token cookie
   */
  setRefreshTokenCookie(res, token) {
    const isProduction = env.NODE_ENV === "production";

    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax", // "none" for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
  },

  /**
   * Set both access and refresh token cookies
   */
  setTokenCookies(res, accessToken, refreshToken) {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  },

  /**
   * Clear access token cookie
   */
  clearAccessTokenCookie(res) {
    const isProduction = env.NODE_ENV === "production";
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
  },

  /**
   * Clear refresh token cookie
   */
  clearRefreshTokenCookie(res) {
    const isProduction = env.NODE_ENV === "production";
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
  },

  /**
   * Clear all auth cookies
   */
  clearAuthCookies(res) {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  },

  /**
   * Get access token from cookie
   */
  getAccessTokenFromCookie(req) {
    return req.cookies?.[ACCESS_TOKEN_COOKIE] || null;
  },

  /**
   * Get refresh token from cookie
   */
  getRefreshTokenFromCookie(req) {
    return req.cookies?.[REFRESH_TOKEN_COOKIE] || null;
  },
};
