'use client';

import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountService } from '@/services/account.service';
import type { Account } from '@/types/index.type';

export default function SoldAccountsSection() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'LIST' | 'RANDOM' | 'CLONE'>('LIST');
  const [page, setPage] = useState(1);
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, any>>({});
  const [loadingCredentials, setLoadingCredentials] = useState<Record<string, boolean>>({});

  // Modal States
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Toggle credential visibility
  const handleToggleCredentials = async (accountId: string) => {
    if (visibleCredentials[accountId]) {
      // Hide credentials
      setVisibleCredentials((prev) => {
        const newState = { ...prev };
        delete newState[accountId];
        return newState;
      });
    } else {
      // Fetch and show credentials
      setLoadingCredentials((prev) => ({ ...prev, [accountId]: true }));
      try {
        const accountWithCredentials = await accountService.getAccountCredentials(accountId);
        setVisibleCredentials((prev) => ({
          ...prev,
          [accountId]: accountWithCredentials.credentials,
        }));
        toast.success('Đã tải thông tin đăng nhập');
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải thông tin đăng nhập');
        setLoadingCredentials((prev) => ({ ...prev, [accountId]: false }));
      } finally {
        setLoadingCredentials((prev) => ({ ...prev, [accountId]: false }));
      }
    }
  };

  const accountColumns = [
    {
      key: 'code',
      label: 'Mã Account',
      render: (val: string) => <span className="font-mono font-medium">{val || '---'}</span>,
    },
    {
      key: 'accountInfo',
      label: 'Thông tin',
      render: (val: string) => (
        <span className="truncate max-w-[200px] block" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'packageId',
      label: 'Danh mục',
      render: (val: any) => (
        <Badge variant="outline">{val?.title || val?.typeId?.name || 'Unknown'}</Badge>
      ),
    },
    {
      key: 'credentials',
      label: 'Tài khoản / Mật khẩu',
      render: (_val: any, item: Account) => {
        const accountId = item._id || '';
        const isVisible = !!visibleCredentials[accountId];
        const isLoading = !!loadingCredentials[accountId];
        const creds = visibleCredentials[accountId];

        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {isVisible && creds ? (
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="font-semibold">User:</span>{' '}
                    <span className="font-mono">{creds.username || 'N/A'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Pass:</span>{' '}
                    <span className="font-mono">{creds.password || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">••••••••</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleToggleCredentials(accountId)}
              disabled={isLoading || !accountId}
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin">⏳</span>
              ) : isVisible ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Giá bán',
      render: (val: number) => (
        <span className="text-primary font-bold">{val?.toLocaleString('vi-VN')}đ</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val: string) => (
        <Badge variant="secondary">Đã bán</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (val: string) => (
        <span className="text-xs text-muted-foreground">
          {new Date(val).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ];

  // Reset page when tab changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'LIST' | 'RANDOM' | 'CLONE');
    setPage(1);
  };

  // Fetch Accounts (SOLD only)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-sold-accounts', activeTab, page],
    queryFn: () =>
      accountService.getAdminAccounts({
        page,
        limit: 10,
        mode: activeTab,
        status: 'SOLD',
      }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      toast.success('Xóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-sold-accounts'] });
      setDeleteDialog(false);
      setAccountToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa tài khoản'),
  });

  const handleDelete = (item: Account) => {
    setAccountToDelete(item);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteMutation.mutate(accountToDelete._id);
    }
  };

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => accountService.bulkDeleteAccounts(ids),
    onSuccess: (data) => {
      toast.success(`Đã xóa ${data.deletedCount} tài khoản`);
      queryClient.invalidateQueries({ queryKey: ['admin-sold-accounts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa tài khoản'),
  });

  const accounts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Tài khoản đã bán</h1>
        <p className="text-muted-foreground">Quản lý các tài khoản đã được bán ra (Lịch sử).</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="LIST">Tài khoản thường (List)</TabsTrigger>
            <TabsTrigger value="RANDOM">Tài khoản vận may (Random)</TabsTrigger>
            <TabsTrigger value="CLONE">Tài khoản Clone</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ManagementTable
        title={
          activeTab === 'LIST'
            ? 'Danh sách TK đã bán (List)'
            : activeTab === 'RANDOM'
              ? 'Danh sách TK đã bán (Random)'
              : 'Danh sách TK đã bán (Clone)'
        }
        columns={accountColumns}
        data={accounts}
        loading={isLoading}
        page={page}
        pageCount={meta?.totalPages || 1}
        onPageChange={setPage}
        onDelete={handleDelete}
        onDeleteMultiple={(ids) => bulkDeleteMutation.mutate(ids)}
        // No Add or Edit for sold accounts
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản {accountToDelete?.code || 'này'}? Hành động này
              không thể hoàn tác.
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
