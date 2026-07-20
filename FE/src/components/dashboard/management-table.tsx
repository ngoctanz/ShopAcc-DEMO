'use client';

import { IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import type * as React from 'react';
import { useState } from 'react';
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

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface CustomAction {
  label: string | ((item: any) => string);
  onClick: (item: any) => void;
  className?: string | ((item: any) => string);
}

interface BulkAction {
  label: string;
  onClick: (ids: string[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
interface ManagementTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  loading?: boolean;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onDeleteMultiple?: (ids: any[]) => void;
  customActions?: CustomAction[];
  bulkActions?: BulkAction[];
  hideAddButton?: boolean;
  hideActions?: boolean;
  hideSelection?: boolean;
  hidePagination?: boolean;
  hideSearch?: boolean;
  onSearch?: (term: string) => void;
  className?: string;
  idField?: string; // Custom ID field name, defaults to '_id'
}

export function ManagementTable({
  title,
  columns,
  data,
  onAdd,
  loading = false,
  page,
  pageCount,
  onPageChange,
  onEdit,
  onDelete,
  onDeleteMultiple,
  customActions,
  bulkActions,
  hideAddButton = false,
  hideActions = false,
  hideSelection = false,
  hidePagination = false,
  hideSearch = false,
  onSearch,
  className,
  idField = '_id',
}: ManagementTableProps) {
  const [selectedIds, setSelectedIds] = useState<any[]>([]);

  // Helper to get item ID
  const getItemId = (item: any) => item[idField];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((item) => getItemId(item));
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (checked: boolean, id: any) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const showToolbar = (onAdd && !hideAddButton) || selectedIds.length > 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showToolbar && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {onAdd && !hideAddButton && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <IconPlus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          )}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {bulkActions && bulkActions.length > 0 ? (
                bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                      action.onClick(selectedIds);
                      setSelectedIds([]);
                    }}
                  >
                    {action.label} ({selectedIds.length})
                  </Button>
                ))
              ) : onDeleteMultiple ? (
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    onDeleteMultiple(selectedIds);
                    setSelectedIds([]);
                  }}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Xóa {selectedIds.length} mục
                </Button>
              ) : null}
            </div>
          )}
        </div>
      )}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-4 border-b bg-muted/30">
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-muted/50">
                {!hideSelection && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="font-bold text-muted-foreground whitespace-nowrap"
                  >
                    {col.label}
                  </TableHead>
                ))}
                {!hideActions && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={getItemId(item) || index} className="border-muted/50 hover:bg-muted/20">
                  {!hideSelection && (
                    <TableCell className="py-4">
                      <Checkbox
                        checked={selectedIds.includes(getItemId(item))}
                        onCheckedChange={(checked) => handleSelectOne(checked as boolean, getItemId(item))}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-4">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </TableCell>
                  ))}
                  {!hideActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconDotsVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {customActions?.map((action, idx) => {
                            const label =
                              typeof action.label === 'function'
                                ? action.label(item)
                                : action.label;
                            const className =
                              typeof action.className === 'function'
                                ? action.className(item)
                                : action.className;
                            return (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => action.onClick(item)}
                                className={className}
                              >
                                {label}
                              </DropdownMenuItem>
                            );
                          })}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDelete(item)}
                            >
                              Xóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!hidePagination && page !== undefined && pageCount !== undefined && onPageChange && (
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
