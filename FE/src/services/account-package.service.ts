import { api } from '@/lib/fetch';
import type { Account, AccountPackage, AccountType, TypeWithPackages } from '@/types/index.type';

const API_BASE = '/account-packages';
const API_TYPES = '/account-types';

/**
 * Package Service - Gọi API account-packages
 */
class PackageService {
  /**
   * Get all packages
   */
  async getAllPackages(params?: {
    typeId?: string;
    mode?: string;
    isActive?: boolean;
  }): Promise<AccountPackage[]> {
    const query = new URLSearchParams();
    if (params?.typeId) query.set('typeId', params.typeId);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));

    const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
    const res = await api.get<AccountPackage[]>(url, { requireAuth: false });
    return res;
  }

  /**
   * Get packages grouped by type (for homepage)
   */
  async getPackagesGroupedByType(): Promise<TypeWithPackages[]> {
    const res = await api.get<TypeWithPackages[]>(`${API_BASE}/grouped`, {
      requireAuth: false,
      revalidate: 60,
    });
    return res;
  }

  /**
   * Get package by ID or slug
   */
  async getPackageById(idOrSlug: string): Promise<AccountPackage> {
    const res = await api.get<AccountPackage>(`${API_BASE}/${idOrSlug}`, {
      requireAuth: false,
    });
    return res;
  }

  /**
   * Get accounts by package (for LIST mode)
   * Supports: page, limit, sort, search, minPrice, maxPrice
   */
  async getAccountsByPackage(
    idOrSlug: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<{
    package: AccountPackage;
    accounts: Account[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));

    const url = query.toString()
      ? `${API_BASE}/${idOrSlug}/accounts?${query}`
      : `${API_BASE}/${idOrSlug}/accounts`;

    const res = await api.get<{
      package: AccountPackage;
      accounts: Account[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url, { requireAuth: false });
    return res;
  }

  /**
   * Random purchase (RANDOM mode)
   */
  async randomPurchase(packageId: string): Promise<{
    account: Account;
    package: AccountPackage;
  }> {
    const res = await api.post<{ account: Account; package: AccountPackage }>(
      `${API_BASE}/${packageId}/random-purchase`,
      {}
    );
    return res;
  }

  /**
   * Clone purchase (CLONE mode)
   * Same as random purchase but uses clone-purchase endpoint
   */
  async clonePurchase(packageId: string): Promise<{
    account: Account;
    package: AccountPackage;
  }> {
    const res = await api.post<{ account: Account; package: AccountPackage }>(
      `${API_BASE}/${packageId}/clone-purchase`,
      {}
    );
    return res;
  }

  /**
   * Bulk clone purchase (CLONE mode)
   * Purchase multiple accounts at once (1-10)
   */
  async clonePurchaseBulk(
    packageId: string,
    quantity: number
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
    package: {
      _id: string;
      title: string;
      mode: string;
    };
    balanceAfter: number;
  }> {
    const res = await api.post<{
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
      package: {
        _id: string;
        title: string;
        mode: string;
      };
      balanceAfter: number;
    }>(`${API_BASE}/${packageId}/clone-purchase-bulk`, { quantity });
    return res;
  }

  /**
   * Get all account types
   */
  async getAccountTypes(): Promise<AccountType[]> {
    const res = await api.get<AccountType[]>(API_TYPES, { requireAuth: false });
    return res;
  }

  /**
   * Get account type by ID
   */
  async getAccountTypeById(id: string): Promise<AccountType> {
    const res = await api.get<AccountType>(`${API_TYPES}/${id}`, {
      requireAuth: false,
    });
    return res;
  }

  // ============ ADMIN METHODS ============

  /**
   * Create Account Type
   */
  async createAccountType(data: Partial<AccountType>): Promise<AccountType> {
    const res = await api.post<AccountType>(API_TYPES, data);
    return res;
  }

  /**
   * Update Account Type
   */
  async updateAccountType(id: string, data: Partial<AccountType>): Promise<AccountType> {
    const res = await api.patch<AccountType>(`${API_TYPES}/${id}`, data);
    return res;
  }

  /**
   * Delete Account Type
   */
  async deleteAccountType(id: string): Promise<void> {
    await api.delete(`${API_TYPES}/${id}`);
  }

  /**
   * Create Account Package
   */
  async createPackage(data: Partial<AccountPackage> | FormData): Promise<AccountPackage> {
    const res = await api.post<AccountPackage>(API_BASE, data);
    return res;
  }

  /**
   * Update Account Package
   */
  async updatePackage(
    id: string,
    data: Partial<AccountPackage> | FormData
  ): Promise<AccountPackage> {
    const res = await api.patch<AccountPackage>(`${API_BASE}/${id}`, data);
    return res;
  }

  /**
   * Delete Account Package
   */
  async deletePackage(id: string): Promise<void> {
    await api.delete(`${API_BASE}/${id}`);
  }

  /**
   * Bulk delete Account Packages (Admin only)
   */
  async bulkDeletePackages(ids: string[]): Promise<{ deletedCount: number }> {
    return api.post<{ deletedCount: number }>(`${API_BASE}/bulk-delete`, {
      ids,
    });
  }

  /**
   * Bulk delete Account Types (Admin only)
   */
  async bulkDeleteAccountTypes(ids: string[]): Promise<{ deletedCount: number }> {
    return api.post<{ deletedCount: number }>(`${API_TYPES}/bulk-delete`, {
      ids,
    });
  }
}

export const packageService = new PackageService();
