'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import { UserDetailModal } from '@/components/modals/user-detail.modal';
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
import { userService } from '@/services/user.service';
import type { User } from '@/types/index.type';

const userColumns = [
  {
    key: 'name',
    label: 'Họ tên',
    render: (val: string, item: any) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {val ? val[0].toUpperCase() : '?'}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{val}</span>
          <span className="text-xs text-muted-foreground">{item.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Vai trò',
    render: (val: string) => (
      <Badge
        variant="outline"
        className={`capitalize ${val === 'admin' ? 'border-primary text-primary' : ''}`}
      >
        {val}
      </Badge>
    ),
  },
  {
    key: 'balance',
    label: 'Số dư',
    render: (val: number) => (
      <span className="font-bold text-green-600">{val?.toLocaleString('vi-VN') || 0}đ</span>
    ),
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (val: string) => (
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${val === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span>{val === 'active' ? 'Hoạt động' : 'Bị cấm'}</span>
      </div>
    ),
  },
];

export default function UsersSection() {
  // Stats for pagination
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);
  const [searchTerm, _setSearchTerm] = useState('');

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [userToLock, setUserToLock] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, searchTerm],
    queryFn: () =>
      userService.getAllUsers({
        page,
        limit: pageSize,
        search: searchTerm,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'banned' }) =>
      userService.updateUser(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật trạng thái tài khoản thành công');
      setShowLockDialog(false);
      setUserToLock(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const handleViewDetail = (user: User) => {
    setSelectedUserId(user._id);
    setShowDetailModal(true);
  };

  const handleToggleLock = (user: User) => {
    setUserToLock(user);
    setShowLockDialog(true);
  };

  const confirmToggleLock = () => {
    if (!userToLock) return;

    const newStatus = userToLock.status === 'active' ? 'banned' : 'active';
    updateStatusMutation.mutate({
      userId: userToLock._id,
      status: newStatus,
    });
  };

  // Bulk operations
  const [bulkAction, setBulkAction] = useState<'lock' | 'unlock' | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'active' | 'banned' }) =>
      userService.bulkUpdateUserStatus(ids, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Đã cập nhật ${data.modifiedCount} tài khoản`);
      setShowBulkDialog(false);
      setBulkAction(null);
      setSelectedIds([]);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
    },
  });

  const handleBulkLock = (ids: string[]) => {
    setSelectedIds(ids);
    setBulkAction('lock');
    setShowBulkDialog(true);
  };

  const handleBulkUnlock = (ids: string[]) => {
    setSelectedIds(ids);
    setBulkAction('unlock');
    setShowBulkDialog(true);
  };

  const confirmBulkAction = () => {
    if (selectedIds.length === 0 || !bulkAction) return;

    const status = bulkAction === 'lock' ? 'banned' : 'active';
    bulkUpdateStatusMutation.mutate({ ids: selectedIds, status });
  };

  // Custom actions for dropdown menu
  const userActions = [
    {
      label: 'Xem chi tiết',
      onClick: handleViewDetail,
    },
    {
      label: (user: User) => (user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'),
      onClick: handleToggleLock,
      className: (user: User) => (user.status === 'active' ? 'text-destructive' : 'text-green-600'),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý thành viên</h1>
        <p className="text-muted-foreground mt-1">Danh sách người dùng và phân quyền.</p>
      </div>
      <ManagementTable
        title="Quản lý thành viên"
        columns={userColumns}
        data={users}
        loading={isLoading}
        pageCount={meta?.totalPages || 1}
        page={page}
        onPageChange={setPage}
        customActions={userActions}
        onDeleteMultiple={handleBulkLock}
        bulkActions={[
          {
            label: 'Khóa tài khoản',
            onClick: handleBulkLock,
            variant: 'destructive' as const,
          },
          {
            label: 'Mở khóa tài khoản',
            onClick: handleBulkUnlock,
            variant: 'default' as const,
          },
        ]}
      />

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          userId={selectedUserId}
        />
      )}

      {/* Single Lock/Unlock Confirmation Dialog */}
      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToLock?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToLock?.status === 'active'
                ? `Bạn có chắc chắn muốn khóa tài khoản "${userToLock?.name}"? Người dùng sẽ không thể đăng nhập sau khi bị khóa.`
                : `Bạn có chắc chắn muốn mở khóa tài khoản "${userToLock?.name}"? Người dùng sẽ có thể đăng nhập lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleLock}
              className={
                userToLock?.status === 'active' ? 'bg-destructive hover:bg-destructive/90' : ''
              }
            >
              {userToLock?.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Lock/Unlock Confirmation Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'lock' ? 'Khóa nhiều tài khoản' : 'Mở khóa nhiều tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'lock'
                ? `Bạn có chắc chắn muốn khóa ${selectedIds.length} tài khoản đã chọn? Người dùng sẽ không thể đăng nhập sau khi bị khóa.`
                : `Bạn có chắc chắn muốn mở khóa ${selectedIds.length} tài khoản đã chọn? Người dùng sẽ có thể đăng nhập lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={bulkAction === 'lock' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {bulkAction === 'lock' ? 'Khóa' : 'Mở khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
