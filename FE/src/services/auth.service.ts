import { APP_CONFIG } from '@/constants/config';
import { API_ROUTES } from '@/constants/routes';
import { api } from '@/lib/fetch';
import type { AuthResponse, User } from '@/types/index.type';
import { storage } from '@/utils/storage';

/**
 * Login payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register payload
 */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Change password payload
 */
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/**
 * Auth Service
 */
class AuthService {
  /**
   * Login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, payload, {
      requireAuth: false,
    });
  }

  /**
   * Register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, payload, {
      requireAuth: false,
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post(API_ROUTES.AUTH.LOGOUT);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>(API_ROUTES.AUTH.ME);
  }

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post(API_ROUTES.AUTH.CHANGE_PASSWORD, payload);
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }, { requireAuth: false });
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<void> {
    await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp }, { requireAuth: false });
  }

  /**
   * Reset password
   */
  async resetPassword(payload: any): Promise<void> {
    await api.post(API_ROUTES.AUTH.RESET_PASSWORD, payload, { requireAuth: false });
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    return api.post<{ accessToken: string }>(API_ROUTES.AUTH.REFRESH, undefined, {
      requireAuth: false,
    });
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    return storage.get<User>(APP_CONFIG.STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();
