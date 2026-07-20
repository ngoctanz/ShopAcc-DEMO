import { api } from '@/lib/fetch';
import type { Transaction } from '@/types/index.type'; // Ensure Transaction type exists or define it here if needed

export interface DashboardStats {
  totalRevenue: number;
  totalTopup: number;
  soldAccountsCount: number;
  totalUsersCount: number;
  recentTransactions: Transaction[];
  chartData: { date: string; revenue: number; topup: number }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return api.get('/dashboard/stats');
  },
};
