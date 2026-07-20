'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import DiscountModal from '@/components/modals/discount.modal';
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
import { type Discount, discountService } from '@/services/discount.service';

export default function DiscountSection() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Discount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Discount | null>(null);

  // Bulk Delete State
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => discountService.getAllDiscounts({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountService.deleteDiscount(id),
    onSuccess: () => {
      toast.success('Xóa chương trình giảm giá thành công');
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa chương trình giảm giá'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => discountService.bulkDeleteDiscounts(ids),
    onSuccess: (data: any) => {
      toast.success(`Đã xóa ${data?.deletedCount || idsToDelete.length} chương trình giảm giá`);
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setDeleteDialogOpen(false);
      setIdsToDelete([]);
      setIsBulkDelete(false);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa danh sách giảm giá'),
  });

  const handleEdit = (item: Discount) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Discount) => {
    setItemToDelete(item);
    setIsBulkDelete(false);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = (ids: string[]) => {
    setIdsToDelete(ids);
    setIsBulkDelete(true);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (isBulkDelete) {
      bulkDeleteMutation.mutate(idsToDelete);
    } else if (itemToDelete) {
      deleteMutation.mutate(itemToDelete._id);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const discounts = data?.data || [];

  // Define columns for ManagementTable
  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (val: string, item: Discount) => (
        <div>
          <p className="font-medium truncate max-w-[200px]">{val}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'discountPercent',
      label: 'Giảm giá',
      render: (val: number) => <Badge variant="secondary">{val}%</Badge>,
    },
    {
      key: 'applicablePackages',
      label: 'Số gói áp dụng',
      render: (val: any[]) => `${Array.isArray(val) ? val.length : 0} gói`,
    },
    {
      key: 'endDate',
      label: 'Thời gian',
      render: (val: string) => (
        <span className="text-sm">{val ? `Đến: ${formatDate(val)}` : 'Không giới hạn'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (val: boolean) =>
        val ? (
          <Badge variant="default">Hoạt động</Badge>
        ) : (
          <Badge variant="secondary">Tạm dừng</Badge>
        ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Giảm giá</h2>
        <p className="text-muted-foreground mt-1">Tạo và quản lý các chương trình giảm giá</p>
      </div>

      <ManagementTable
        title="Danh sách giảm giá"
        columns={columns}
        data={discounts}
        loading={isLoading}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteMultiple={handleBulkDelete}
      />

      <DiscountModal open={modalOpen} onOpenChange={setModalOpen} data={editingItem} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete
                ? `Bạn có chắc chắn muốn xóa ${idsToDelete.length} chương trình giảm giá đã chọn?`
                : `Bạn có chắc chắn muốn xóa chương trình giảm giá "${itemToDelete?.title}"?`}
              <br />
              Giá của các gói và tài khoản sẽ được khôi phục về ban đầu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
            >
              {(deleteMutation.isPending || bulkDeleteMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
