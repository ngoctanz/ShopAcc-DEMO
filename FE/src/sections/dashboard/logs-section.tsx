'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManagementTable } from '@/components/dashboard/management-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auditService } from '@/services/audit.service';
import { LogDetailModal } from '@/components/modals/log-detail.modal';
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

export default function LogsSection() {
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);
  const [filterMode, setFilterMode] = useState<'all' | 'errors'>('all');
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Delete confirm states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  
  // Bulk delete states
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filterMode, page, pageSize],
    queryFn: () => {
      if (filterMode === 'errors') {
        return auditService.getErrorLogs({ page, limit: pageSize });
      }
      return auditService.getAllLogs({ page, limit: pageSize });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => auditService.deleteLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success('Xóa nhật ký thành công');
      setShowDeleteDialog(false);
      setLogToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa nhật ký');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => auditService.bulkDeleteLogs(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`Đã xóa ${data.deletedCount} nhật ký`);
      setShowBulkDeleteDialog(false);
      setSelectedIds([]);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa nhật ký');
    },
  });

  const logs = data?.logs || [];
  const meta = data?.meta;

  // Handlers
  const handleViewDetail = (log: any) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleDelete = (log: any) => {
    setLogToDelete(log._id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (logToDelete) {
      deleteMutation.mutate(logToDelete);
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    setSelectedIds(ids);
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const logColumns = [
    {
      key: 'action',
      label: 'Hành động',
      render: (val: string) => <span className="font-medium font-mono text-xs">{val}</span>,
    },
    {
      key: 'user',
      label: 'Người thực hiện',
      render: (_: any, item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.userId?.name || 'System/Unknown'}</span>
          <span className="text-xs text-muted-foreground">{item.userId?.email}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      key: 'details',
      label: 'Chi tiết',
      render: (val: any) => (
        <span
          className="text-xs text-muted-foreground truncate max-w-[200px] block"
          title={JSON.stringify(val)}
        >
          {JSON.stringify(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val: string) => (
        <Badge
          variant={val === 'success' ? 'outline' : 'destructive'}
          className={val === 'success' ? 'border-green-500 text-green-600' : ''}
        >
          {val === 'success' ? 'Thành công' : val === 'warning' ? 'Cảnh báo' : 'Thất bại'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      render: (val: string) => (
        <span className="text-xs text-muted-foreground">{new Date(val).toLocaleString('vi-VN')}</span>
      ),
    },
  ];

  const logActions = [
    {
      label: 'Xem chi tiết',
      onClick: handleViewDetail,
    },
    {
        label: 'Xóa nhật ký',
        onClick: handleDelete,
        className: 'text-destructive',
    }
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhật ký hệ thống</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi toàn bộ hoạt động quan trọng trong hệ thống.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Tabs
          value={filterMode}
          onValueChange={(val) => {
            setFilterMode(val as 'all' | 'errors');
            setPage(1); // Reset page on filter change
          }}
        >
          <TabsList>
            <TabsTrigger value="all">Tất cả nhật ký</TabsTrigger>
            <TabsTrigger value="errors" className="text-red-500 data-[state=active]:text-red-600">
              Nhật ký lỗi
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ManagementTable
        title={filterMode === 'all' ? 'Tất cả hoạt động' : 'Hoạt động lỗi'}
        columns={logColumns}
        data={logs}
        loading={isLoading}
        pageCount={meta?.totalPages || 1}
        page={page}
        onPageChange={setPage}
        customActions={logActions}
        onDeleteMultiple={handleBulkDelete}
        bulkActions={[
            {
                label: 'Xóa các mục đã chọn',
                onClick: handleBulkDelete,
                variant: 'destructive',
            }
        ]}
      />

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal 
            open={showDetailModal} 
            onOpenChange={setShowDetailModal} 
            log={selectedLog} 
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhật ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhiều nhật ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedIds.length} nhật ký đã chọn? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa {selectedIds.length} mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
