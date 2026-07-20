'use client';

import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Filter,
  Loader2,
  Package,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/ui/custom-pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types/index.type';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: {
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'Đang chờ',
    },
    completed: {
      color: 'bg-green-500/10 text-green-600 border-green-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Hoàn tất',
    },
    cancelled: {
      color: 'bg-red-500/10 text-red-600 border-red-500/30',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Đã hủy',
    },
  };
  const { color, icon, label } = config[status] || config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-background border rounded-full text-xs font-semibold ${color}`}
    >
      {icon}
      {label}
    </span>
  );
};

// Group orders by batchId or individual
type OrderGroup = {
  id: string; // batchId or single order._id
  orders: Order[];
  isBulk: boolean;
  totalPrice: number;
  createdAt: string;
  status: string;
};

export function PurchaseHistorySection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Detail Modal State
  const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const result = await orderService.getUserOrders(params);
      setOrders((result.orders || []) as any);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải lịch sử mua hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Group orders by batchId
  const orderGroups = useMemo(() => {
    const groups: OrderGroup[] = [];
    const batchMap = new Map<string, Order[]>();
    const singles: Order[] = [];

    // Separate batched and single orders
    for (const order of orders) {
      if (order.batchId) {
        if (!batchMap.has(order.batchId)) {
          batchMap.set(order.batchId, []);
        }
        batchMap.get(order.batchId)!.push(order);
      } else {
        singles.push(order);
      }
    }

    // Create groups for batched orders
    for (const [batchId, batchOrders] of batchMap.entries()) {
      groups.push({
        id: batchId,
        orders: batchOrders,
        isBulk: true,
        totalPrice: batchOrders.reduce((sum, o) => sum + o.price, 0),
        createdAt: batchOrders[0].createdAt,
        status: batchOrders[0].status,
      });
    }

    // Create groups for single orders
    for (const order of singles) {
      groups.push({
        id: order._id,
        orders: [order],
        isBulk: false,
        totalPrice: order.price,
        createdAt: order.createdAt,
        status: order.status,
      });
    }

    // Sort by createdAt desc
    return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const handleViewDetails = async (group: OrderGroup) => {
    setIsDetailLoading(true);
    // Don't open modal yet - wait for data to load successfully

    try {
      // Fetch credentials for all orders in group
      // Don't catch individual errors - let them bubble up
      const credentialsPromises = group.orders.map((order) =>
        orderService.getCredentials(order._id)
      );
      const credentials = await Promise.all(credentialsPromises);

      // Attach credentials to orders
      const ordersWithCreds = group.orders.map((order, idx) => ({
        ...order,
        fetchedCredentials: credentials[idx],
      }));

      setSelectedGroup({
        ...group,
        orders: ordersWithCreds as any,
      });
      
      // Only open modal after successful data fetch
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
      // Don't open modal on error - global error handler will show error modal
    } finally {
      setIsDetailLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã sao chép');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredGroups =
    filterStatus === 'all' ? orderGroups : orderGroups.filter((g) => g.status === filterStatus);

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedGroups,
    setCurrentPage,
  } = usePagination({
    data: filteredGroups,
    itemsPerPage: 5,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <ShoppingBag className="w-6 h-6 text-purple-500" />
            </div>
            Lịch Sử Mua Hàng
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quản lý các tài khoản trò chơi bạn đã mua
          </p>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-5 py-3">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Tổng chi tiêu
          </p>
          <p className="text-xl font-black text-purple-600">
            {orders
              .filter((o) => o.status === 'completed')
              .reduce((sum, o) => sum + o.price, 0)
              .toLocaleString('vi-VN')}
            đ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border rounded-xl p-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn hàng</SelectItem>
              <SelectItem value="completed">Hoàn tất</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Bạn chưa mua tài khoản nào. Hãy khám phá kho game đa dạng của chúng tôi nhé!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedGroups.map((group) => {
              const firstOrder = group.orders[0];
              const account: any = firstOrder.accountId || {};
              const pkg: any = account.packageId || {};
              const snapshot: any = firstOrder.accountSnapshot || {};

              const isAccountDeleted = !firstOrder.accountId;
              const isRandomOrClone = pkg.mode === 'RANDOM' || pkg.mode === 'CLONE';
              
              let accountImage = '/images/placeholder.svg';
              if (isAccountDeleted) {
                accountImage = snapshot.image || '/images/placeholder.svg';
              } else if (isRandomOrClone) {
                accountImage =
                  pkg.image ||
                  account.coverImage ||
                  account.images?.[0] ||
                  '/images/placeholder.svg';
              } else {
                accountImage =
                  account.coverImage ||
                  account.images?.[0] ||
                  pkg.image ||
                  '/images/placeholder.svg';
              }

              const accountTitle = isAccountDeleted
                ? snapshot.packageTitle || 'Tài khoản Game'
                : pkg.title || 'Tài khoản Game';

              const accountCode = isAccountDeleted
                ? snapshot.code || firstOrder._id.slice(-6).toUpperCase()
                : account.code || firstOrder._id.slice(-6).toUpperCase();

              return (
                <div
                  key={group.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={accountImage} alt="Acc" className="w-full h-full object-cover" />
                      {group.isBulk && (
                        <div className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ×{group.orders.length}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-mono">
                          #{accountCode}
                        </Badge>
                        {group.isBulk && (
                          <Badge className="text-[10px] px-1.5 h-5 bg-purple-100 text-purple-700 border-purple-200">
                            {group.orders.length} tài khoản
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(group.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground line-clamp-1 mb-1">
                        {accountTitle}
                      </h3>
                      <p className="text-sm font-bold text-primary">
                        {group.totalPrice.toLocaleString('vi-VN')}đ
                        {group.isBulk && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({firstOrder.price.toLocaleString('vi-VN')}đ/acc)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
                    <StatusBadge status={group.status} />
                    <Button
                      onClick={() => handleViewDetails(group)}
                      disabled={group.status !== 'completed'}
                      variant={group.status === 'completed' ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {group.status === 'completed' ? 'Xem thông tin' : 'Chi tiết'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredGroups.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Order Detail Modal - Show all accounts in group */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[90%] max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Chi tiết đơn hàng
              </span>
              {selectedGroup?.isBulk && (
                <span className="text-sm sm:text-base text-muted-foreground font-normal">
                  ({selectedGroup.orders.length} tài khoản)
                </span>
              )}
            </DialogTitle>
            <DialogDescription>Thông tin đăng nhập tài khoản game</DialogDescription>
          </DialogHeader>

          {isDetailLoading || !selectedGroup ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {/* Order Info */}
              <div className="flex items-center gap-3 sm:gap-4 bg-muted/40 p-3 rounded-xl border">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-background border flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">
                    {selectedGroup.isBulk ? 'Mua hàng loạt' : 'Đơn hàng'} #
                    {selectedGroup.id.substring(selectedGroup.id.length - 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedGroup.createdAt)} • {selectedGroup.totalPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-200 shrink-0 hidden sm:inline-flex"
                >
                  Đã thanh toán
                </Badge>
              </div>

              {/* Accounts List */}
              <div className="space-y-4">
                {selectedGroup.orders.map((order: any, idx) => {
                  const creds = order.fetchedCredentials;
                  return (
                    <div key={order._id} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                      {selectedGroup.isBulk && (
                        <div className="flex items-center justify-between pb-2 border-b">
                          <span className="text-xs font-bold text-muted-foreground">
                            Tài khoản #{idx + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {order.price.toLocaleString('vi-VN')}đ
                          </Badge>
                        </div>
                      )}

                      {creds ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">
                              Tài khoản / Email
                            </label>
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0 bg-background border rounded-lg px-3 py-2 font-mono text-sm break-all">
                                {creds.username}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  copyToClipboard(creds.username, `username-${order._id}`)
                                }
                                className={cn(
                                  'shrink-0 h-9 w-9',
                                  copiedField === `username-${order._id}` &&
                                    'text-green-600 border-green-200 bg-green-50'
                                )}
                              >
                                {copiedField === `username-${order._id}` ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">
                              Mật khẩu
                            </label>
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0 bg-background border rounded-lg px-3 py-2 font-mono text-sm break-all">
                                {creds.password}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  copyToClipboard(creds.password, `password-${order._id}`)
                                }
                                className={cn(
                                  'shrink-0 h-9 w-9',
                                  copiedField === `password-${order._id}` &&
                                    'text-green-600 border-green-200 bg-green-50'
                                )}
                              >
                                {copiedField === `password-${order._id}` ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {creds.additionalInfo && (
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold uppercase text-muted-foreground">
                                Thông tin thêm
                              </label>
                              <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2 text-sm break-words">
                                {creds.additionalInfo}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                          <p className="text-red-600 text-xs font-medium">
                            Không tìm thấy thông tin đăng nhập
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-muted-foreground text-center bg-muted/30 p-2 rounded-lg">
                * Vui lòng đổi mật khẩu ngay sau khi nhận tài khoản để bảo mật.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
