'use client';

import { IconChevronDown, IconChevronRight, IconDotsVertical, IconEye, IconEyeOff, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { accountService } from '@/services/account.service';
import type { Account } from '@/types/index.type';

interface CloneAccountTableProps {
  title: string;
  data: Account[];
  loading?: boolean;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  onAdd?: () => void;
  onEdit?: (item: Account) => void;
  onDelete?: (item: Account) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onUploadExcel?: () => void;
}

export function CloneAccountTable({
  title,
  data,
  loading = false,
  page,
  pageCount,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onUploadExcel,
}: CloneAccountTableProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadingCredentials, setLoadingCredentials] = useState<Set<string>>(new Set());
  const [cloneCredentials, setCloneCredentials] = useState<Record<string, any[]>>({});

  // Toggle expand row
  const toggleExpand = async (accountId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
      // Load credentials if not already loaded
      if (!cloneCredentials[accountId]) {
        await loadCloneCredentials(accountId);
      }
    }
    setExpandedIds(newExpanded);
  };

  // Load clone credentials
  const loadCloneCredentials = async (accountId: string) => {
    setLoadingCredentials((prev) => new Set(prev).add(accountId));
    try {
      const result = await accountService.getCloneCredentials(accountId);
      setCloneCredentials((prev) => ({
        ...prev,
        [accountId]: result.cloneAccounts || [],
      }));
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách tài khoản con');
    } finally {
      setLoadingCredentials((prev) => {
        const next = new Set(prev);
        next.delete(accountId);
        return next;
      });
    }
  };

  // Delete a single sub-account
  const handleDeleteSubAccount = async (accountId: string, index: number) => {
    const subAccount = cloneCredentials[accountId]?.[index];
    if (!subAccount) return;

    if (!confirm(`Xóa tài khoản ${subAccount.username}?`)) return;

    try {
      await accountService.deleteCloneSubAccount(accountId, index);
      
      // Update local state
      setCloneCredentials((prev) => ({
        ...prev,
        [accountId]: prev[accountId].filter((_, i) => i !== index),
      }));

      // Invalidate to refresh quantity
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success('Đã xóa tài khoản con');
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa tài khoản con');
    }
  };

  // Select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Select one
  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  // Format price
  const formatPrice = (price: number) => `${price?.toLocaleString('vi-VN')}đ`;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {onAdd && (
            <Button onClick={onAdd}>
              <IconPlus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          )}
          {onUploadExcel && (
            <Button variant="outline" onClick={onUploadExcel}>
              <IconUpload className="mr-2 h-4 w-4" />
              Tải từ Excel
            </Button>
          )}
        </div>
        {selectedIds.length > 0 && onDeleteMultiple && (
          <Button
            variant="destructive"
            onClick={() => {
              onDeleteMultiple(selectedIds);
              setSelectedIds([]);
            }}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Xóa {selectedIds.length} mục
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-muted/50">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="font-bold">Mã</TableHead>
                <TableHead className="font-bold">Thông tin</TableHead>
                <TableHead className="font-bold">Gói</TableHead>
                <TableHead className="font-bold">Giá</TableHead>
                <TableHead className="font-bold">Số lượng</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Chưa có tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                data.map((account) => (
                  <>
                    {/* Main Row */}
                    <TableRow
                      key={account._id}
                      className={cn(
                        'border-muted/50 hover:bg-muted/20',
                        expandedIds.has(account._id) && 'bg-purple-50 dark:bg-purple-900/20'
                      )}
                    >
                      <TableCell className="py-4">
                        <Checkbox
                          checked={selectedIds.includes(account._id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(checked as boolean, account._id)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleExpand(account._id)}
                        >
                          {expandedIds.has(account._id) ? (
                            <IconChevronDown className="h-4 w-4" />
                          ) : (
                            <IconChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="py-4 font-mono text-sm">
                        #{account.code}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="truncate max-w-[200px] block" title={account.accountInfo}>
                          {account.accountInfo}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline">
                          {(account as any).packageId?.title || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-primary font-bold">{formatPrice(account.price)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant={account.quantity && account.quantity > 0 ? 'default' : 'secondary'} className="font-mono bg-purple-600">
                          {account.quantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            account.status === 'AVAILABLE'
                              ? 'outline'
                              : account.status === 'SOLD'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {account.status === 'AVAILABLE'
                            ? 'Còn hàng'
                            : account.status === 'SOLD'
                            ? 'Đã bán'
                            : 'Đã khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleExpand(account._id)}>
                              {expandedIds.has(account._id) ? (
                                <>
                                  <IconEyeOff className="mr-2 h-4 w-4" />
                                  Ẩn tài khoản con
                                </>
                              ) : (
                                <>
                                  <IconEye className="mr-2 h-4 w-4" />
                                  Xem tài khoản con
                                </>
                              )}
                            </DropdownMenuItem>
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(account)}>
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete(account)}
                              >
                                Xóa
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Clone Accounts */}
                    {expandedIds.has(account._id) && (
                      <TableRow key={`${account._id}-expanded`} className="bg-muted/10">
                        <TableCell colSpan={9} className="p-0">
                          <div className="p-4 pl-16 border-l-4 border-purple-500">
                            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-3">
                              Danh sách tài khoản con ({cloneCredentials[account._id]?.length || account.quantity || 0})
                            </h4>
                            {loadingCredentials.has(account._id) ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Đang tải...</span>
                              </div>
                            ) : cloneCredentials[account._id]?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="text-xs">
                                      <TableHead className="py-2">STT</TableHead>
                                      <TableHead className="py-2">Username</TableHead>
                                      <TableHead className="py-2">Password</TableHead>
                                      <TableHead className="py-2">Thông tin thêm</TableHead>
                                      <TableHead className="py-2 w-[50px]">Xóa</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {cloneCredentials[account._id].map((clone, index) => (
                                      <TableRow key={index} className="text-sm">
                                        <TableCell className="py-2 font-mono">{index + 1}</TableCell>
                                        <TableCell className="py-2 font-mono">{clone.username}</TableCell>
                                        <TableCell className="py-2 font-mono">{clone.password}</TableCell>
                                        <TableCell className="py-2 text-muted-foreground">
                                          {clone.additionalInfo || '-'}
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteSubAccount(account._id, index)}
                                          >
                                            <IconTrash className="h-3 w-3" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Chưa có tài khoản con nào. Sử dụng "Tải từ Excel" để thêm.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {page !== undefined && pageCount !== undefined && onPageChange && pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pageCount}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
