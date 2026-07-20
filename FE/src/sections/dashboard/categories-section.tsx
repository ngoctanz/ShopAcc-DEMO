'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import AccountPackageModal from '@/components/modals/account-packages-manager.modal';
import AccountTypeModal from '@/components/modals/account-types-manager.modal';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { packageService } from '@/services/account-package.service';
import type { AccountPackage, AccountType } from '@/types/index.type';

export default function CategoriesSection() {
  const queryClient = useQueryClient();

  // State for Account Types
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AccountType | null>(null);
  const [deleteTypeDialog, setDeleteTypeDialog] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<AccountType | null>(null);

  // State for Packages
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AccountPackage | null>(null);
  const [deletePackageDialog, setDeletePackageDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<AccountPackage | null>(null);

  // === 1. ACCOUNT TYPES LOGIC ===
  const { data: types = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['account-types'],
    queryFn: () => packageService.getAccountTypes(),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id: string) => packageService.deleteAccountType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-types'] });
      toast.success('Xóa danh mục thành công');
      setDeleteTypeDialog(false);
      setTypeToDelete(null);
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi xóa danh mục'),
  });

  const handleAddType = () => {
    setEditingType(null);
    setTypeModalOpen(true);
  };

  const handleEditType = (item: AccountType) => {
    setEditingType(item);
    setTypeModalOpen(true);
  };

  const handleDeleteType = (item: AccountType) => {
    setTypeToDelete(item);
    setDeleteTypeDialog(true);
  };

  const confirmDeleteType = () => {
    if (typeToDelete) {
      deleteTypeMutation.mutate(typeToDelete._id);
    }
  };

  const typeColumns = [
    { key: 'code', label: 'Mã' },
    { key: 'name', label: 'Tên danh mục' },
    {
      key: 'description',
      label: 'Mô tả',
      render: (val: string) => (
        <span className="line-clamp-2 max-w-[300px] block text-sm" title={val}>
          {val || '---'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (active: boolean) => (
        <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Hoạt động' : 'Ẩn'}</Badge>
      ),
    },
  ];

  // === 2. PACKAGES LOGIC ===
  const { data: packages = [], isLoading: loadingPackages } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => packageService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Xóa gói thành công');
      setDeletePackageDialog(false);
      setPackageToDelete(null);
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi xóa gói'),
  });

  const handleAddPackage = () => {
    setEditingPackage(null);
    setPackageModalOpen(true);
  };

  const handleEditPackage = (item: AccountPackage) => {
    setEditingPackage(item);
    setPackageModalOpen(true);
  };

  const handleDeletePackage = (item: AccountPackage) => {
    setPackageToDelete(item);
    setDeletePackageDialog(true);
  };

  const confirmDeletePackage = () => {
    if (packageToDelete) {
      deletePackageMutation.mutate(packageToDelete._id);
    }
  };

  // Bulk delete mutations
  const bulkDeleteTypesMutation = useMutation({
    mutationFn: (ids: string[]) => packageService.bulkDeleteAccountTypes(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account-types'] });
      toast.success(`Đã xóa ${data.deletedCount} danh mục`);
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi xóa danh mục'),
  });

  const bulkDeletePackagesMutation = useMutation({
    mutationFn: (ids: string[]) => packageService.bulkDeletePackages(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(`Đã xóa ${data.deletedCount} gói`);
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi xóa gói'),
  });

  const packageColumns = [
    { key: 'order', label: 'STT' },
    { key: 'title', label: 'Tên gói' },
    {
      key: 'description',
      label: 'Mô tả',
      render: (val: string) => (
        <span className="line-clamp-2 max-w-[300px] block text-sm" title={val}>
          {val || '---'}
        </span>
      ),
    },
    {
      key: 'image',
      label: 'Ảnh',
      render: (val: string) => (
        <div className="relative w-10 h-10 rounded-md overflow-hidden border">
          <img
            src={val || '/images/placeholder.png'}
            alt="Package"
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      key: 'mode',
      label: 'Chế độ',
      render: (val: string) => <Badge variant="outline">{val}</Badge>,
    },
    { key: 'price', label: 'Giá', render: (val: number) => <span>{val?.toLocaleString()}đ</span> },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (val: boolean) => (
        <Badge variant={val ? 'default' : 'secondary'}>{val ? 'Hoạt động' : 'Ẩn'}</Badge>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Danh mục & Gói tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý các tựa game (Account Types) và các gói bán hàng (Packages).
        </p>
      </div>

      <Tabs defaultValue="types" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="types">Danh mục Tài khoản</TabsTrigger>
          <TabsTrigger value="packages">Gói Tài khoản</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <ManagementTable
            title="Quản lý Danh mục"
            columns={typeColumns}
            data={types}
            loading={loadingTypes}
            onAdd={handleAddType}
            onEdit={handleEditType}
            onDelete={handleDeleteType}
            onDeleteMultiple={(ids) => bulkDeleteTypesMutation.mutate(ids)}
          />
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <ManagementTable
            title="Quản lý Gói Tài khoản"
            columns={packageColumns}
            data={packages}
            loading={loadingPackages}
            onAdd={handleAddPackage}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
            onDeleteMultiple={(ids) => bulkDeletePackagesMutation.mutate(ids)}
          />
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <AccountTypeModal open={typeModalOpen} onOpenChange={setTypeModalOpen} data={editingType} />

      <AccountPackageModal
        open={packageModalOpen}
        onOpenChange={setPackageModalOpen}
        data={editingPackage}
      />

      {/* Delete Type Confirmation Dialog */}
      <AlertDialog open={deleteTypeDialog} onOpenChange={setDeleteTypeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{typeToDelete?.name}"? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteType}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Package Confirmation Dialog */}
      <AlertDialog open={deletePackageDialog} onOpenChange={setDeletePackageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa gói "{packageToDelete?.title}"? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePackage}
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
