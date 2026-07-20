import { APP_CONFIG } from '@/constants/config';
import { triggerGlobalError } from '@/contexts/global-error-context';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: any;
  message?: string;
  error?: string;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Fetch options with Next.js cache
 */
export interface FetchOptions extends RequestInit {
  // Next.js cache options
  revalidate?: number | false; // seconds
  tags?: string[];
  // Custom options
  requireAuth?: boolean;
  baseURL?: string;
  // Skip auto-refresh on 401 (used internally)
  skipRefresh?: boolean;
}

/**
 * Access token from context (set by useAuth hook)
 * This allows client components to pass token to API calls
 */
let contextAccessToken: string | null = null;

/**
 * Refresh token function reference (set by AuthProvider)
 */
let refreshTokenFn: (() => Promise<string | null>) | null = null;

/**
 * Set access token from context
 */
export function setContextAccessToken(token: string | null) {
  contextAccessToken = token;
}

/**
 * Set refresh token function from AuthProvider
 */
export function setRefreshTokenFunction(fn: (() => Promise<string | null>) | null) {
  refreshTokenFn = fn;
}

/**
 * Get access token from context (client) or cookies (server)
 */
function getAccessToken(): string | null {
  // Client-side: use context token
  if (typeof window !== 'undefined') {
    return contextAccessToken;
  }
  // Server-side: token should be in cookies (handled by middleware)
  return null;
}

/**
 * Create fetch headers
 */
function createHeaders(requireAuth = true, isFormData = false): HeadersInit {
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Check if current page is a protected route that requires authentication
 */
function isProtectedRoute(): boolean {
  if (typeof window === 'undefined') return false;

  const pathname = window.location.pathname;

  // List of protected route prefixes
  const protectedPrefixes = ['/user', '/dashboard', '/payment'];

  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Handle auth failure - clear data and optionally redirect
 * Only redirect if on a protected route
 */
function handleAuthFailure() {
  contextAccessToken = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

    // Only redirect if on a protected route
    if (isProtectedRoute()) {
      window.location.href = '/login';
    }
  }
}

/**
 * Custom error class for errors already handled by global error modal
 * Local catch blocks should check for this and NOT show their own error modal
 */
export class GloballyHandledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GloballyHandledError';
  }
}

/**
 * Handle fetch response
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorData: ApiErrorResponse = isJson
      ? await response.json()
      : {
          success: false,
          message: response.statusText || 'Something went wrong',
          statusCode: response.status,
        };

    // Handle 429 Too Many Requests (rate limiting)
    if (response.status === 429) {
      const message =
        'Úi! Hệ thống phát hiện hoạt động bất thường 🤔 Bạn ơi đi uống trà, ăn bánh nghỉ ngơi 15 phút rồi quay lại nha~';
      triggerGlobalError(message);
      // Throw GloballyHandledError so local catch blocks know not to show their own modal
      throw new GloballyHandledError(message);
    }

    // 401 is handled separately in apiFetch for retry logic
    throw new Error(errorData.message || 'API Error');
  }

  return isJson ? response.json() : { success: true, data: null as T };
}

/**
 * Base API fetch function with Next.js cache support and auto-refresh
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    baseURL = APP_CONFIG.API.BASE_URL,
    revalidate,
    tags,
    skipRefresh = false,
    ...fetchOptions
  } = options;

  const url = `${baseURL}${endpoint}`;
  const isFormData = fetchOptions.body instanceof FormData;

  // Build fetch options
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...createHeaders(requireAuth, isFormData),
      ...fetchOptions.headers,
    },
    credentials: 'include', // Include cookies for refresh token
  };

  // Add Next.js cache configuration
  if (revalidate !== undefined) {
    config.next = { revalidate, ...(config.next as any) };
  }

  if (tags && tags.length > 0) {
    config.next = { tags, ...(config.next as any) };
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth && !skipRefresh) {
      // Try to refresh the access token
      if (refreshTokenFn && typeof window !== 'undefined') {
        const newToken = await refreshTokenFn();

        if (newToken) {
          // Update context token
          contextAccessToken = newToken;

          // Retry the original request with new token
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          const retryResponse = await fetch(url, retryConfig);

          // If retry also fails with 401, give up
          if (retryResponse.status === 401) {
            handleAuthFailure();
            throw new Error('Session expired. Please login again.');
          }

          return handleResponse<T>(retryResponse);
        }
      }

      // No refresh function or refresh failed
      handleAuthFailure();
      throw new Error('Session expired. Please login again.');
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

/**
 * API Service with Next.js fetch
 */
export const api = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await apiFetch<T>(endpoint, {
      method: 'GET',
      ...options,
    });
    return response.data;
  },

  /**
   * GET request with full pagination response (data + meta)
   */
  async getPaginated<T = any>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<{ data: T; meta: any }> {
    const response = await apiFetch<T>(endpoint, {
      method: 'GET',
      ...options,
    });
    return { data: response.data, meta: response.meta };
  },

  /**
   * POST request (no cache by default)
   */
  async post<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    const response = await apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache: 'no-store', // Don't cache POST requests
      ...options,
    });
    return response.data;
  },

  /**
   * PUT request (no cache by default)
   */
  async put<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    const response = await apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache: 'no-store',
      ...options,
    });
    return response.data;
  },

  /**
   * PATCH request (no cache by default)
   */
  async patch<T = any>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    const response = await apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache: 'no-store',
      ...options,
    });
    return response.data;
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await apiFetch<T>(endpoint, {
      method: 'DELETE',
      cache: 'no-store',
      ...options,
    });
    return response.data;
  },

  /**
   * Internal upload handler with retry logic
   */
  async _uploadWithRetry<T = any>(endpoint: string, formData: FormData): Promise<T> {
    const token = getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchUpload = async (authHeaders: HeadersInit) => {
      return fetch(`${APP_CONFIG.API.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
        cache: 'no-store',
        credentials: 'include',
      });
    };

    const response = await fetchUpload(headers);

    // Handle 401 for upload
    if (response.status === 401 && refreshTokenFn) {
      const newToken = await refreshTokenFn();
      if (newToken) {
        contextAccessToken = newToken;
        const retryResponse = await fetchUpload({ Authorization: `Bearer ${newToken}` });

        if (retryResponse.status === 401) {
          handleAuthFailure();
          throw new Error('Session expired. Please login again.');
        }

        const result = await handleResponse<T>(retryResponse);
        return result.data;
      }
      handleAuthFailure();
      throw new Error('Session expired. Please login again.');
    }

    const result = await handleResponse<T>(response);
    return result.data;
  },

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this._uploadWithRetry<T>(endpoint, formData);
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple<T = any>(endpoint: string, files: File[], fieldName = 'files'): Promise<T> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(fieldName, file);
    });
    return this._uploadWithRetry<T>(endpoint, formData);
  },
};

export async function fetchWithCache<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return api.get<T>(endpoint, options);
}

export async function revalidateTag(tag: string) {
  const { revalidateTag: nextRevalidateTag } = await import('next/cache');
  return nextRevalidateTag(tag, 'max');
}

export async function revalidatePath(path: string) {
  const { revalidatePath: nextRevalidatePath } = await import('next/cache');
  return nextRevalidatePath(path, 'page');
}
