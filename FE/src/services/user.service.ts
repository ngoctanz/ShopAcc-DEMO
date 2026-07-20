import { API_ROUTES } from '@/constants/routes';
import { api } from '@/lib/fetch';
import type { FilterParams, PaginatedResponse, User } from '@/types/index.type';

export interface UserFilterParams extends FilterParams {
  role?: string;
  status?: string;
}

/**
 * User Service
 */
class UserService {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(params?: UserFilterParams): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const endpoint = query ? `${API_ROUTES.USERS.LIST}?${query}` : API_ROUTES.USERS.LIST;

    return api.getPaginated<User[]>(endpoint, {
      tags: ['users'],
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    return api.get<User>(API_ROUTES.USERS.DETAIL(id), {
      tags: ['users', `user-${id}`],
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return api.patch<User>(API_ROUTES.USERS.UPDATE(id), data);
  }

  /**
   * Update user balance (Admin only)
   */
  async updateUserBalance(
    userId: string,
    data: { amount: number; action: 'add' | 'subtract'; reason: string }
  ): Promise<User> {
    return api.patch<User>(API_ROUTES.USERS.UPDATE_BALANCE(userId), data);
  }

  /**
   * Bulk update user status (Admin only)
   */
  async bulkUpdateUserStatus(
    ids: string[],
    status: 'active' | 'banned'
  ): Promise<{ modifiedCount: number }> {
    return api.post<{ modifiedCount: number }>('/users/bulk-update-status', { ids, status });
  }
}

export const userService = new UserService();
