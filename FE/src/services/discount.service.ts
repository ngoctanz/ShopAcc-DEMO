import { api } from '@/lib/fetch';

const API_BASE = '/discounts';

export interface Discount {
  _id: string;
  title: string;
  description?: string;
  discountPercent: number;
  applicablePackages: string[] | any[];
  endDate?: Date | string;
  isActive: boolean;
  isValid?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface DiscountCreateInput {
  title: string;
  description?: string;
  discountPercent: number;
  applicablePackages: string[];
  endDate?: Date | string;
  isActive?: boolean;
}

export interface DiscountUpdateInput {
  title?: string;
  description?: string;
  discountPercent?: number;
  applicablePackages?: string[];
  endDate?: Date | string;
  isActive?: boolean;
}

class DiscountService {
  /**
   * Get all discounts
   */
  async getAllDiscounts(params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{
    data: Discount[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));

    const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
    return api.getPaginated(url);
  }

  /**
   * Get discount by ID
   */
  async getDiscountById(id: string): Promise<Discount> {
    return api.get(`${API_BASE}/${id}`);
  }

  /**
   * Create discount
   */
  async createDiscount(data: DiscountCreateInput): Promise<Discount> {
    return api.post(API_BASE, data);
  }

  /**
   * Update discount
   */
  async updateDiscount(id: string, data: DiscountUpdateInput): Promise<Discount> {
    return api.patch(`${API_BASE}/${id}`, data);
  }

  /**
   * Delete discount
   */
  async deleteDiscount(id: string): Promise<void> {
    return api.delete(`${API_BASE}/${id}`);
  }

  /**
   * Bulk delete discounts
   */
  async bulkDeleteDiscounts(ids: string[]): Promise<void> {
    return api.post(`${API_BASE}/bulk-delete`, { ids });
  }
}

export const discountService = new DiscountService();
