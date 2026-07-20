import { API_ROUTES } from '@/constants/routes';
import { api } from '@/lib/fetch';
import type { Account, AccountFilterParams, PaginatedResponse } from '@/types/index.type';

/**
 * Account Service
 */
class AccountService {
  /**
   * Get accounts with pagination and filters
   * Uses Next.js cache with revalidate
   */
  async getAccounts(params?: AccountFilterParams): Promise<PaginatedResponse<Account>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.packageId) searchParams.set('packageId', params.packageId);
    if (params?.typeId) searchParams.set('typeId', params.typeId);
    if (params?.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const endpoint = query ? `${API_ROUTES.ACCOUNTS.LIST}?${query}` : API_ROUTES.ACCOUNTS.LIST;

    return api.getPaginated<Account[]>(endpoint, {
      revalidate: 60, // Cache for 60 seconds
      tags: ['accounts'], // Tag for revalidation
      requireAuth: false,
    });
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<Account> {
    return api.get<Account>(API_ROUTES.ACCOUNTS.DETAIL(id), {
      revalidate: 30,
      tags: ['accounts', `account-${id}`],
    });
  }

  /**
   * Create account
   */
  async createAccount(data: any): Promise<Account> {
    return api.post<Account>(API_ROUTES.ACCOUNTS.CREATE, data);
  }

  /**
   * Update account
   */
  async updateAccount(id: string, data: any): Promise<Account> {
    return api.patch<Account>(API_ROUTES.ACCOUNTS.UPDATE(id), data);
  }

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<void> {
    return api.delete(API_ROUTES.ACCOUNTS.DELETE(id));
  }

  /**
   * Purchase account (uses user balance by default)
   */
  async purchaseAccount(accountId: string): Promise<any> {
    return api.post(API_ROUTES.ACCOUNTS.PURCHASE(accountId), {});
  }

  /**
   * Get accounts for Admin (with credentials)
   */
  async getAdminAccounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    typeId?: string;
    status?: string;
    mode?: 'LIST' | 'RANDOM' | 'CLONE';
  }): Promise<PaginatedResponse<Account>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.typeId) searchParams.set('typeId', params.typeId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.mode) searchParams.set('mode', params.mode);

    const query = searchParams.toString();
    const endpoint = `/accounts/admin/list?${query}`;

    return api.getPaginated<Account[]>(endpoint, {
      requireAuth: true,
    });
  }

  /**
   * Get account credentials (Admin only)
   * Requires admin token authentication
   */
  async getAccountCredentials(id: string): Promise<Account> {
    return api.get<Account>(`/accounts/${id}/credentials`, {
      requireAuth: true,
    });
  }

  /**
   * Bulk delete accounts (Admin only)
   */
  async bulkDeleteAccounts(ids: string[]): Promise<{ deletedCount: number }> {
    return api.post<{ deletedCount: number }>('/accounts/bulk-delete', { ids });
  }

  /**
   * Bulk create accounts (Admin only)
   */
  async bulkCreateAccounts(accounts: any[]): Promise<Account[]> {
    return api.post<Account[]>('/accounts/bulk', { accounts });
  }

  // ============ CLONE ACCOUNT METHODS ============

  /**
   * Create a clone account with initial sub-accounts (Admin only)
   */
  async createCloneAccount(
    accountData: {
      packageId: string;
      accountInfo?: string;
      price: number;
      coverImage?: string;
    },
    cloneAccounts: Array<{ username: string; password: string; additionalInfo?: string }>
  ): Promise<Account> {
    return api.post<Account>('/accounts/clone', { accountData, cloneAccounts });
  }

  /**
   * Add clone accounts to an existing account (Admin only)
   */
  async addCloneAccounts(
    accountId: string,
    accounts: Array<{ username: string; password: string; additionalInfo?: string }>
  ): Promise<{ account: Account; addedCount: number }> {
    return api.post<{ account: Account; addedCount: number }>(
      `/accounts/${accountId}/clone-accounts`,
      { accounts }
    );
  }

  /**
   * Get clone account credentials - all sub-accounts (Admin only)
   */
  async getCloneCredentials(
    accountId: string
  ): Promise<{
    account: Account;
    cloneAccounts: Array<{ username: string; password: string; additionalInfo?: string }>;
    totalCount: number;
  }> {
    return api.get(`/accounts/${accountId}/clone-credentials`, {
      requireAuth: true,
    });
  }

  /**
   * Delete a single sub-account from a clone account (Admin only)
   */
  async deleteCloneSubAccount(
    accountId: string,
    index: number
  ): Promise<{ success: boolean; remainingCount: number }> {
    return api.delete(`/accounts/${accountId}/clone-accounts/${index}`, {
      requireAuth: true,
    });
  }

  /**
   * Purchase credentials from a specific clone account (User)
   */
  async purchaseCloneAccount(
    accountId: string,
    quantity: number = 1
  ): Promise<{
    success: boolean;
    batchId: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
    orders: Array<{
      _id: string;
      price: number;
      status: string;
      createdAt: string;
      accountCode: string;
    }>;
    account: {
      _id: string;
      code: string;
      accountInfo: string;
      remainingQuantity: number;
    };
    package: {
      _id: string;
      title: string;
      mode: string;
    };
    balanceAfter: number;
  }> {
    return api.post(`/accounts/${accountId}/clone-purchase`, { quantity });
  }
}
export const accountService = new AccountService();

