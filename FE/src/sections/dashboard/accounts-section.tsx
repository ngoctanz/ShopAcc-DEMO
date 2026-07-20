'use client';

import { IconEye, IconEyeOff, IconUpload } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CloneAccountTable } from '@/components/dashboard/clone-account-table';
import { ManagementTable } from '@/components/dashboard/management-table';
import CloneAccountModal from '@/components/modals/clone-account.modal';
import ExcelUploadModal from '@/components/modals/excel-upload.modal';
import ListAccountModal from '@/components/modals/list-account.modal';
import RandomAccountModal from '@/components/modals/random-account.modal';
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
import { packageService } from '@/services/account-package.service';
import type { Account } from '@/types/index.type';

export default function AccountsSection() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'LIST' | 'RANDOM' | 'CLONE'>('LIST');
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, any>>({});
  const [loadingCredentials, setLoadingCredentials] = useState<Record<string, boolean>>({});

  // Modal States
  const [listModalOpen, setListModalOpen] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Excel Upload State
  const [excelModalOpen, setExcelModalOpen] = useState(false);

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
        setLoadingCredentials((prev) => ({ ...prev, [accountId]: false })); // Ensure loading state is reset on error too
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
      label: 'Giá',
      render: (val: number) => (
        <span className="text-primary font-bold">{val?.toLocaleString('vi-VN')}đ</span>
      ),
    },
    {
      key: 'quantity',
      label: 'Số lượng',
      render: (val: number, item: Account) => {
        // Only show quantity for clone accounts
        if (!item.isClone) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge variant={val > 0 ? 'default' : 'secondary'} className="font-mono">
            {val || 0}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val: string) => (
        <Badge
          variant={val === 'AVAILABLE' ? 'outline' : val === 'SOLD' ? 'secondary' : 'destructive'}
        >
          {val === 'AVAILABLE' ? 'Còn hàng' : val === 'SOLD' ? 'Đã bán' : 'Đã khóa'}
        </Badge>
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

  // Reset page when tab or filter changes
  const handleTabChange = (val: string) => {
    setActiveTab(val as 'LIST' | 'RANDOM' | 'CLONE');
    setPage(1);
  };

  const _handleTypeChange = (val: string) => {
    setSelectedType(val);
    setPage(1);
  };

  // Fetch Account Types for Filter
  const { data: types = [] } = useQuery({
    queryKey: ['account-types'],
    queryFn: () => packageService.getAccountTypes(),
  });

  // Fetch Accounts
  const { data, isLoading } = useQuery({
    queryKey: ['admin-accounts', activeTab, page, selectedType],
    queryFn: () =>
      accountService.getAdminAccounts({
        page,
        limit: 10,
        mode: activeTab,
        status: 'AVAILABLE',
        typeId: selectedType === 'all' ? undefined : selectedType,
      }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      toast.success('Xóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      setDeleteDialog(false);
      setAccountToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa tài khoản'),
  });

  const handleAdd = () => {
    setEditingAccount(null);
    if (activeTab === 'LIST') {
      setListModalOpen(true);
    } else if (activeTab === 'RANDOM') {
      setRandomModalOpen(true);
    } else if (activeTab === 'CLONE') {
      setRandomModalOpen(true);
    }
  };

  const handleEdit = (item: Account) => {
    setEditingAccount(item);
    if (activeTab === 'LIST') {
      setListModalOpen(true);
    } else if (activeTab === 'RANDOM') {
      setRandomModalOpen(true);
    } else if (activeTab === 'CLONE') {
      setRandomModalOpen(true);
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa tài khoản'),
  });

  const accounts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h1>
        <p className="text-muted-foreground">Danh sách tất cả tài khoản game đang rao bán.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="LIST">Tài khoản thường (List)</TabsTrigger>
            <TabsTrigger value="RANDOM">Tài khoản vận may (Random)</TabsTrigger>
            <TabsTrigger value="CLONE">Tài khoản Clone</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Upload button removed - now in CloneAccountTable */}
      </div>

      {/* Table - Different for CLONE mode */}
      {activeTab === 'CLONE' ? (
        <CloneAccountTable
          title="Danh sách Tài khoản Clone"
          data={accounts}
          loading={isLoading}
          page={page}
          pageCount={meta?.totalPages || 1}
          onPageChange={setPage}
          onAdd={() => {
            setEditingAccount(null);
            setCloneModalOpen(true);
          }}
          onEdit={(item) => {
            setEditingAccount(item);
            setCloneModalOpen(true);
          }}
          onDelete={handleDelete}
          onDeleteMultiple={(ids) => bulkDeleteMutation.mutate(ids)}
          onUploadExcel={() => setExcelModalOpen(true)}
        />
      ) : (
        <ManagementTable
          title={
            activeTab === 'LIST'
              ? 'Danh sách Tài khoản thường'
              : 'Danh sách Tài khoản Random'
          }
          columns={accountColumns}
          data={accounts}
          loading={isLoading}
          page={page}
          pageCount={meta?.totalPages || 1}
          onPageChange={setPage}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={(ids) => bulkDeleteMutation.mutate(ids)}
        />
      )}

      <ListAccountModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        data={editingAccount}
      />

      <RandomAccountModal
        open={randomModalOpen}
        onOpenChange={setRandomModalOpen}
        data={editingAccount}
        mode={activeTab === 'LIST' ? undefined : activeTab} // Only pass mode if not LIST (though for LIST it shouldn't open this modal)
      />

      <ExcelUploadModal open={excelModalOpen} onOpenChange={setExcelModalOpen} mode={activeTab} />

      <CloneAccountModal
        open={cloneModalOpen}
        onOpenChange={setCloneModalOpen}
        editingAccount={editingAccount}
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
