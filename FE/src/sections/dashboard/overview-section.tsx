'use client';

import { useQuery } from '@tanstack/react-query';
import { ManagementTable } from '@/components/dashboard/management-table';
import { Badge } from '@/components/ui/badge';
import { ChartAreaInteractive } from '@/components/ui/chart-area-interactive';
import { SectionCards } from '@/components/ui/section-cards';
import { dashboardService } from '@/services/dashboard.service';

const _getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
    case 'paid':
      return 'bg-green-500 hover:bg-green-600 border-none text-white';
    case 'pending':
    case 'processing':
      return 'bg-yellow-500 hover:bg-yellow-600 border-none text-white';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500 hover:bg-red-600 border-none text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const _getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
    case 'paid':
      return 'Thành công';
    case 'pending':
      return 'Chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'failed':
      return 'Thất bại';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const transactionColumns = [
  {
    key: 'user',
    label: 'Người dùng',
    render: (_: any, item: any) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{item.userId?.name || 'Unknown'}</span>
        <span className="text-xs text-muted-foreground">{item.userId?.email}</span>
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Loại GD',
    render: (val: string) => (
      <Badge variant="outline" className="capitalize">
        {val === 'topup' || val === 'card_topup'
          ? 'Nạp tiền'
          : val === 'purchase'
            ? 'Mua hàng'
            : val === 'refund'
              ? 'Hoàn tiền'
              : val}
      </Badge>
    ),
  },
  {
    key: 'amount',
    label: 'Số tiền',
    render: (val: number, item: any) => {
      const isPositive =
        item.type === 'topup' || item.type === 'card_topup' || item.type === 'refund';
      return (
        <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : '-'}
          {val.toLocaleString('vi-VN')}đ
        </span>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: () => (
      <Badge className="bg-green-500 hover:bg-green-600 border-none text-white">Thành công</Badge>
    ),
  },
  {
    key: 'createdAt',
    label: 'Thời gian',
    render: (val: string) => (
      <span className="text-sm text-muted-foreground">{new Date(val).toLocaleString('vi-VN')}</span>
    ),
  },
];

export default function OverviewSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Quản trị hệ thống</h1>
        <p className="text-muted-foreground mt-1">
          Hệ thống quản lý shop tài khoản game chuyên nghiệp.
        </p>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        <SectionCards stats={stats} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-2 lg:col-span-4 transition-all hover:scale-[1.01]">
            <ChartAreaInteractive data={stats?.chartData || []} className="h-full" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <ManagementTable
              title="Giao dịch gần nhất"
              columns={transactionColumns}
              data={stats?.recentTransactions || []}
              loading={isLoading}
              hidePagination={true}
              hideAddButton={true}
              hideSearch={true}
              hideActions={true}
              hideSelection={true}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
