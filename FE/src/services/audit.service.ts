import { API_ROUTES } from '@/constants/routes';
import { api } from '@/lib/fetch';
import type { FilterParams } from '@/types/index.type';

// Inline AuditLog type since it's not exported from types
interface AuditLog {
  _id: string;
  userId?: string;
  action: string;
  details?: string;
  status: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditFilterParams extends FilterParams {
  action?: string;
  userId?: string;
  status?: string;
}

/**
 * Audit Service
 */
class AuditService {
  /**
   * Get all logs
   */
  async getAllLogs(params?: AuditFilterParams): Promise<{ logs: AuditLog[]; meta: any }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.action) searchParams.set('action', params.action);
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const endpoint = query ? `${API_ROUTES.AUDIT_LOGS.LIST}?${query}` : API_ROUTES.AUDIT_LOGS.LIST;

    return api.get<{ logs: AuditLog[]; meta: any }>(endpoint, {
      tags: ['audit-logs'],
    });
  }

  /**
   * Get error logs
   */
  async getErrorLogs(params?: AuditFilterParams): Promise<{ logs: AuditLog[]; meta: any }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.action) searchParams.set('action', params.action);
    if (params?.userId) searchParams.set('userId', params.userId);

    const query = searchParams.toString();
    const endpoint = query
      ? `${API_ROUTES.AUDIT_LOGS.ERRORS}?${query}`
      : API_ROUTES.AUDIT_LOGS.ERRORS;

    return api.get<{ logs: AuditLog[]; meta: any }>(endpoint, {
      tags: ['audit-logs', 'audit-errors'],
    });
  }

  /**
   * Delete log by ID
   */
  async deleteLog(id: string): Promise<void> {
    return api.delete(`${API_ROUTES.AUDIT_LOGS.LIST}/${id}`);
  }

  /**
   * Bulk delete logs
   */
  async bulkDeleteLogs(ids: string[]): Promise<{ deletedCount: number }> {
    return api.delete<{ deletedCount: number }>(API_ROUTES.AUDIT_LOGS.LIST, {
      body: JSON.stringify({ ids }),
    });
  }
}

export const auditService = new AuditService();
