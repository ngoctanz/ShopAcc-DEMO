import { api } from '@/lib/fetch';

export interface Notification {
  _id: string;
  type: 'system' | 'promotion' | 'maintenance' | 'news';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  isRead?: boolean;
}

const API_BASE = '/notifications';

export const notificationService = {
  /**
   * Get notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ data: Notification[]; meta: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.type) query.set('type', params.type);

    const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
    return api.getPaginated<Notification[]>(url);
  },

  /**
   * Get latest notification
   */
  async getLatestNotification(): Promise<Notification | null> {
    try {
      const res = await api.get<Notification | null>(`${API_BASE}/latest`);
      return res;
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      return null;
    }
  },

  /**
   * Create notification (Admin)
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    return api.post<Notification>(API_BASE, data);
  },

  /**
   * Update notification (Admin)
   */
  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    return api.patch<Notification>(`${API_BASE}/${id}`, data);
  },

  /**
   * Delete notification (Admin)
   */
  async deleteNotification(id: string): Promise<void> {
    return api.delete(`${API_BASE}/${id}`);
  },

  /**
   * Bulk delete notifications (Admin)
   */
  async bulkDeleteNotifications(ids: string[]): Promise<void> {
    return api.post(`${API_BASE}/bulk-delete`, { ids });
  },
};
