'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import { CreateNotificationModal } from '@/components/modals/create-notification.modal';
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
import { type Notification, notificationService } from '@/services/notification.service';

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'system':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Hệ thống
        </Badge>
      );
    case 'promotion':
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Khuyến mãi
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          Bảo trì
        </Badge>
      );
    case 'news':
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          Tin tức
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const notificationColumns = [
  {
    key: 'title',
    label: 'Tiêu đề',
    render: (val: string, item: any) => (
      <div className="flex flex-col max-w-[300px]">
        <span className="font-medium truncate">{val}</span>
        <span className="text-xs text-muted-foreground truncate">{item.message}</span>
      </div>
    ),
  },
  { key: 'type', label: 'Loại', render: (val: string) => getTypeBadge(val) },
  {
    key: 'link',
    label: 'Liên kết',
    render: (val: string) =>
      val ? (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline max-w-[200px] truncate block"
        >
          {val}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: 'createdAt',
    label: 'Ngày tạo',
    render: (val: string) => (
      <span className="text-sm text-muted-foreground">{new Date(val).toLocaleString('vi-VN')}</span>
    ),
  },
];

export default function NotificationsSection() {
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationToEdit, setNotificationToEdit] = useState<Notification | null>(null);

  // Delete confirm state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  // Bulk Delete State
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, pageSize],
    queryFn: () =>
      notificationService.getNotifications({
        page,
        limit: pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Xóa thông báo thành công');
      setShowDeleteDialog(false);
      setNotificationToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa thông báo');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => notificationService.bulkDeleteNotifications(ids),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Đã xóa ${data?.deletedCount || idsToDelete.length} thông báo`);
      setShowDeleteDialog(false);
      setIdsToDelete([]);
      setIsBulkDelete(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh sách thông báo');
    },
  });

  const notifications = data?.data || [];
  const meta = data?.meta;

  const handleCreate = () => {
    setNotificationToEdit(null);
    setShowCreateModal(true);
  };

  const handleEdit = (notification: Notification) => {
    setNotificationToEdit(notification);
    setShowCreateModal(true);
  };

  const handleDelete = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsBulkDelete(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = (ids: string[]) => {
    setIdsToDelete(ids);
    setIsBulkDelete(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (isBulkDelete) {
      bulkDeleteMutation.mutate(idsToDelete);
    } else if (notificationToDelete) {
      deleteMutation.mutate(notificationToDelete._id);
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý thông báo</h1>
        <p className="text-muted-foreground mt-1">Gửi thông báo hệ thống đến toàn bộ người dùng.</p>
      </div>

      <ManagementTable
        title="Danh sách thông báo"
        columns={notificationColumns}
        data={notifications}
        loading={isLoading}
        pageCount={meta?.totalPages || 1}
        page={page}
        onPageChange={setPage}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteMultiple={handleBulkDelete}
      />

      {/* Create/Edit Modal */}
      <CreateNotificationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        notificationToEdit={notificationToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete
                ? `Bạn có chắc chắn muốn xóa ${idsToDelete.length} thông báo đã chọn?`
                : `Bạn có chắc chắn muốn xóa thông báo "${notificationToDelete?.title}"?`}
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
