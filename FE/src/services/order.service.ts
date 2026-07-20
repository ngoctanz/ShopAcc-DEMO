import { api } from '@/lib/fetch';
import type { Account, AccountPackage } from '@/types/index.type';

export interface Order {
  _id: string;
  userId: string;
  accountId: string;
  price: number;
  status: 'completed' | 'cancelled' | 'refunded';
  batchId?: string | null; // For bulk purchases - groups multiple orders
  accountCredentials?: {
    username: string;
    password: string;
    additionalInfo?: string;
  };
  accountSnapshot?: {
    code?: string;
    packageTitle?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseAccountResult {
  order: Order;
  account: Account;
  user: {
    balance: number;
  };
}

export interface RandomPurchaseResult {
  order: Order;
  account: Account;
  package: AccountPackage;
  user: {
    balance: number;
  };
}

/**
 * Order Service - Purchase accounts and manage orders
 */
class OrderService {
  /**
   * Purchase account (LIST mode)
   * POST /accounts/:id/purchase
   */
  async purchaseAccount(accountId: string): Promise<PurchaseAccountResult> {
    const res = await api.post<{ success: boolean; data: PurchaseAccountResult }>(
      `/accounts/${accountId}/purchase`,
      {} // No body needed - BE uses user balance by default
    );
    return res.data;
  }

  /**
   * Random purchase (RANDOM mode)
   * POST /account-packages/:id/random-purchase
   */
  async randomPurchase(packageId: string): Promise<RandomPurchaseResult> {
    const res = await api.post<{ success: boolean; data: RandomPurchaseResult }>(
      `/account-packages/${packageId}/random-purchase`,
      {}
    );
    return res.data;
  }

  /**
   * Get user's orders (list - no credentials)
   * GET /orders
   */
  async getUserOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{
    orders: Order[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const endpoint = query ? `/orders?${query}` : '/orders';

    const result = await api.getPaginated<Order[]>(endpoint);
    return { orders: result.data, meta: result.meta };
  }

  /**
   * Get all orders (Admin)
   */
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }): Promise<{
    orders: Order[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.userId) searchParams.set('userId', params.userId);

    const query = searchParams.toString();
    const endpoint = query ? `/orders?${query}` : '/orders';

    const result = await api.getPaginated<Order[]>(endpoint);
    return { orders: result.data, meta: result.meta };
  }

  /**
   * Get single order (with credentials - owner only)
   * GET /orders/:id
   */
  async getOrderById(orderId: string): Promise<Order> {
    return api.get<Order>(`/orders/${orderId}`);
  }

  /**
   * Get credentials
   */
  async getCredentials(orderId: string): Promise<{
    username: string;
    password: string;
    additionalInfo?: string;
  }> {
    return api.get(`/orders/${orderId}/credentials`);
  }

  /**
   * Delete order (Admin)
   */
  async deleteOrder(orderId: string): Promise<void> {
    return api.delete(`/orders/${orderId}`);
  }

  /**
   * Bulk delete orders (Admin)
   */
  async bulkDeleteOrders(orderIds: string[]): Promise<void> {
    return api.post('/orders/bulk-delete', { ids: orderIds });
  }

  /**
   * Get recent purchases for banner ticker (public)
   * GET /orders/recent-purchases
   */
  async getRecentPurchases(limit = 20): Promise<
    Array<{
      userName: string;
      description: string;
      price: number;
      createdAt: string;
    }>
  > {
    const res = await api.get<
      Array<{
        userName: string;
        description: string;
        price: number;
        createdAt: string;
      }>
    >(`/orders/recent-purchases?limit=${limit}`);
    return res;
  }
}

export const orderService = new OrderService();
