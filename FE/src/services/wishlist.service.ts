import { api } from '@/lib/fetch';
import type { Account } from '@/types/index.type';

export interface WishlistItemResponse {
  accountId: Account;
  addedAt: string;
}

export interface WishlistResponse {
  _id: string;
  userId: string;
  items: WishlistItemResponse[];
  itemCount: number;
}

const API_BASE = '/wishlist';

export const wishlistService = {
  /**
   * Get user wishlist
   */
  async getWishlist(_params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: WishlistItemResponse[]; pagination: any }> {
    try {
      // BE returns wishlist object with items array
      const wishlist = await api.get<WishlistResponse>(API_BASE);
      const items = wishlist?.items || [];

      return {
        data: items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      };
    } catch {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },

  /**
   * Add to wishlist
   */
  async addToWishlist(accountId: string): Promise<any> {
    return api.post(`${API_BASE}/items`, { accountId });
  },

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(accountId: string): Promise<any> {
    return api.delete(`${API_BASE}/items/${accountId}`);
  },

  /**
   * Check if account is in wishlist
   */
  async isInWishlist(accountId: string): Promise<boolean> {
    try {
      const { data: items } = await this.getWishlist();
      return items.some((item) => item.accountId?._id === accountId);
    } catch {
      return false;
    }
  },
};
