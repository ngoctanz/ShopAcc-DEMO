import { APP_CONFIG } from '@/constants/config';

const apiURL = process.env.NEXT_PUBLIC_API_URL || APP_CONFIG.API.BASE_URL;

import { getAccessToken } from '@/utils/storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const url = `${apiURL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    // Return data directly from response.data if exists, otherwise return data
    return data.data !== undefined ? data.data : data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    }
    throw error;
  }
}

/**
 * API client with common methods
 */
export const api = {
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
