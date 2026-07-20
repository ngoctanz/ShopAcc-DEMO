'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Loader2, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type Order, orderService } from '@/services/order.service';

const toVND = (price: number) => {
  return `${price.toLocaleString('vi-VN')}đ`;
};

// Group orders by batchId
type OrderGroup = {
  id: string; // batchId or single order._id
  orders: Order[];
  isBulk: boolean;
  totalPrice: number;
  createdAt: string;
  status: string;
  userId: any;
  accountId: any;
};

export default function OrdersSection() {
  const [page, setPage] = useState(1);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderGroup | null>(null);
  const [ordersToDelete, setOrdersToDelete] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => orderService.getAllOrders({ page, limit: 50 }),
  });

  // Group orders by batchId
  const orderGroups = useMemo(() => {
    const orders = data?.orders || [];
    const groups: OrderGroup[] = [];
    const batchMap = new Map<string, Order[]>();
    const singles: Order[] = [];

    // Separate batched and single orders
    for (const order of orders) {
      if (order.batchId) {
        if (!batchMap.has(order.batchId)) {
          batchMap.set(order.batchId, []);
        }
        batchMap.get(order.batchId)!.push(order as any);
      } else {
        singles.push(order as any);
      }
    }

    // Create groups for batched orders
    for (const [batchId, batchOrders] of batchMap.entries()) {
      const firstOrder = batchOrders[0] as any;
      groups.push({
        id: batchId,
        orders: batchOrders,
        isBulk: true,
        totalPrice: batchOrders.reduce((sum, o) => sum + o.price, 0),
        createdAt: firstOrder.createdAt,
        status: firstOrder.status,
        userId: firstOrder.userId,
        accountId: firstOrder.accountId,
      });
    }

    // Create groups for single orders
    for (const order of singles) {
      const o = order as any;
      groups.push({
        id: o._id,
        orders: [order],
        isBulk: false,
        totalPrice: o.price,
        createdAt: o.createdAt,
        status: o.status,
        userId: o.userId,
        accountId: o.accountId,
      });
    }

    // Sort by createdAt desc
    return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data?.orders]);

  // View Details with credentials
  const handleViewDetails = async (group: OrderGroup) => {
    setIsDetailLoading(true);
    setSelectedGroup(group);
    setShowDetailDialog(true);

    try {
      // Fetch credentials for all orders in group
      const credentialsPromises = group.orders.map((order) =>
        orderService.getCredentials(order._id).catch(() => null)
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
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
      toast.error('Không thể lấy thông tin tài khoản');
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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => orderService.bulkDeleteOrders(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Xóa đơn hàng thành công');
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa đơn hàng');
    },
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => orderService.bulkDeleteOrders(ids),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(`Đã xóa ${data?.deletedCount || ordersToDelete.length} đơn hàng`);
      setShowDeleteDialog(false);
      setOrdersToDelete([]);
      setIsBulkDelete(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh sách đơn hàng');
    },
  });

  // Handlers
  const handleDelete = (group: OrderGroup) => {
    setOrderToDelete(group);
    setIsBulkDelete(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = (ids: string[]) => {
    // Find all order IDs from selected groups
    const allOrderIds: string[] = [];
    for (const id of ids) {
      const group = orderGroups.find((g) => g.id === id);
      if (group) {
        allOrderIds.push(...group.orders.map((o) => o._id));
      }
    }
    setOrdersToDelete(allOrderIds);
    setIsBulkDelete(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (isBulkDelete) {
      bulkDeleteMutation.mutate(ordersToDelete);
    } else if (orderToDelete) {
      const orderIds = orderToDelete.orders.map((o) => o._id);
      deleteMutation.mutate(orderIds);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Mã đơn',
      render: (_val: string, row: OrderGroup) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{row.id.slice(-6).toUpperCase()}</span>
          {row.isBulk && (
            <Badge className="text-[10px] px-1.5 h-5 bg-purple-100 text-purple-700 border-purple-200">
              ×{row.orders.length}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'accountId',
      label: 'Sản phẩm',
      render: (_val: any, row: OrderGroup) => {
        const account = row.accountId as any;
        return (
          <div className="flex flex-col max-w-[200px]">
            <span className="font-medium truncate">{account?.code || 'N/A'}</span>
            <span className="text-xs text-muted-foreground truncate">
              {account?.packageId?.title || 'Unknown Package'}
              {row.isBulk && ` (${row.orders.length} acc)`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'userId',
      label: 'Khách hàng',
      render: (_val: any, row: OrderGroup) => {
        const user = row.userId as any;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user?.name || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        );
      },
    },
    {
      key: 'totalPrice',
      label: 'Số tiền',
      render: (_val: number, row: OrderGroup) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.totalPrice.toLocaleString('vi-VN')}đ</span>
          {row.isBulk && (
            <span className="text-xs text-muted-foreground">
              {row.orders[0].price.toLocaleString('vi-VN')}đ/acc
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (_val: string, row: OrderGroup) => (
        <Badge
          className={
            row.status === 'completed'
              ? 'bg-green-500'
              : row.status === 'cancelled'
                ? 'bg-red-500'
                : 'bg-yellow-500'
          }
        >
          {row.status === 'completed' ? 'Thành công' : row.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      render: (_val: string, row: OrderGroup) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi, xem chi tiết và quản lý các đơn hàng. Đơn mua nhiều acc được nhóm lại.
        </p>
      </div>

      <ManagementTable
        title="Danh sách đơn hàng"
        columns={columns}
        data={orderGroups}
        loading={isLoading}
        pageCount={data?.meta?.totalPages || 1}
        page={page}
        onPageChange={setPage}
        hideAddButton={true}
        idField="id"
        customActions={[
          {
            label: 'Xem chi tiết',
            onClick: handleViewDetails,
          },
          {
            label: 'Xóa đơn hàng',
            onClick: handleDelete,
            className: 'text-destructive font-medium',
          },
        ]}
        onDeleteMultiple={handleBulkDelete}
      />

      {/* View Details Dialog - Show all accounts in group */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Chi tiết đơn hàng #{selectedGroup?.id.slice(-6).toUpperCase()}
              {selectedGroup?.isBulk && (
                <Badge className="ml-2 bg-purple-100 text-purple-700">
                  {selectedGroup.orders.length} tài khoản
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn hàng này.</DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedGroup && (
            <div className="grid gap-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Khách hàng</h4>
                  <div className="flex flex-col mt-1">
                    <span className="font-medium">{(selectedGroup.userId as any)?.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(selectedGroup.userId as any)?.email}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Trạng thái</h4>
                  <div className="mt-1">
                    <Badge
                      className={
                        selectedGroup.status === 'completed'
                          ? 'bg-green-500'
                          : selectedGroup.status === 'cancelled'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }
                    >
                      {selectedGroup.status === 'completed'
                        ? 'Thành công'
                        : selectedGroup.status === 'cancelled'
                          ? 'Đã hủy'
                          : 'Đang xử lý'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Sản phẩm</h4>
                  <div className="flex flex-col mt-1">
                    <span className="font-medium">{(selectedGroup.accountId as any)?.code}</span>
                    <span className="text-sm text-muted-foreground">
                      {(selectedGroup.accountId as any)?.packageId?.title}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tổng giá trị</h4>
                  <p className="text-lg font-bold text-primary mt-1">
                    {toVND(selectedGroup.totalPrice)}
                    {selectedGroup.isBulk && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({toVND(selectedGroup.orders[0].price)}/acc)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Accounts List with Credentials */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Thông tin tài khoản {selectedGroup.isBulk && `(${selectedGroup.orders.length} acc)`}
                </h4>
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
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-background border rounded-lg px-3 py-2 font-mono text-sm truncate">
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
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-background border rounded-lg px-3 py-2 font-mono text-sm truncate">
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
                                <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
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
              </div>

              <div className="text-xs text-muted-foreground flex justify-between pt-2 border-t">
                <span>Ngày tạo: {new Date(selectedGroup.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete
                ? `Bạn có chắc chắn muốn xóa ${ordersToDelete.length} đơn hàng đã chọn?`
                : orderToDelete?.isBulk
                  ? `Bạn có chắc chắn muốn xóa nhóm đơn hàng #${orderToDelete?.id.slice(-6).toUpperCase()} (${orderToDelete?.orders.length} tài khoản)?`
                  : `Bạn có chắc chắn muốn xóa đơn hàng #${orderToDelete?.id.slice(-6).toUpperCase()}?`}
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
