'use client';

import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LogDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: any;
}

export function LogDetailModal({ open, onOpenChange, log }: LogDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!log) return null;

  const InfoRow = ({
    label,
    value,
    copyable = false,
    fieldName = '',
    className = '',
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
    fieldName?: string;
    className?: string;
  }) => (
    <div className={`flex justify-between items-start py-3 border-b border-border/50 last:border-0 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="text-sm text-foreground text-right break-words max-w-full">
            {value || 'N/A'}
        </div>
        {copyable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => handleCopy(String(value), fieldName)}
          >
            {copiedField === fieldName ? (
              <IconCheck className="h-3 w-3 text-green-500" />
            ) : (
              <IconCopy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết nhật ký</DialogTitle>
          <DialogDescription>ID: {log._id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Action */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
             <div className="flex items-center gap-3">
                 <div className="font-bold text-lg">{log.action}</div>
             </div>
             <Badge
                variant={log.status === 'success' ? 'outline' : 'destructive'}
                className={log.status === 'success' ? 'border-green-500 text-green-600 bg-green-500/10' : ''}
              >
                {log.status === 'success' ? 'Thành công' : log.status === 'warning' ? 'Cảnh báo' : 'Thất bại'}
              </Badge>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Người thực hiện</h4>
            <div className="bg-card border rounded-lg p-4">
              {log.userId ? (
                  <>
                    <InfoRow label="User ID" value={log.userId._id} copyable fieldName="userId" />
                    <InfoRow label="Tên người dùng" value={log.userId.name} />
                    <InfoRow label="Email" value={log.userId.email} copyable fieldName="userEmail" />
                  </>
              ) : (
                  <div className="text-sm text-muted-foreground italic">System / Anonymous</div>
              )}
               <InfoRow label="IP Address" value={log.ip} copyable fieldName="ip" />
               <InfoRow label="User Agent" value={log.userAgent} className="max-h-[100px] overflow-y-auto" />
            </div>
          </div>

          {/* Resource Info */}
           <div className="space-y-1">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Tài nguyên tác động</h4>
            <div className="bg-card border rounded-lg p-4">
              <InfoRow label="Resource Type" value={log.resource} />
              <InfoRow label="Resource ID" value={log.resourceId} copyable fieldName="resourceId" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Chi tiết hoạt động</h4>
            <div className="bg-card border rounded-lg p-4">
              {Object.entries(log.details || {}).length > 0 ? (
                Object.entries(log.details).map(([key, value]: [string, any]) => {
                  let label = key;
                  let displayValue = value;

                  // Format common keys
                  switch (key) {
                    case 'amount':
                      label = 'Số tiền';
                      displayValue = typeof value === 'number' 
                        ? `${value.toLocaleString('vi-VN')}đ` 
                        : value;
                      break;
                    case 'action':
                      label = 'Hành động';
                      displayValue = value === 'add' ? 'Cộng tiền (+)' : value === 'subtract' ? 'Trừ tiền (-)' : value;
                      break;
                    case 'reason':
                      label = 'Lý do';
                      break;
                    case 'targetUser':
                      label = 'Người nhận';
                      break;
                    case 'email': 
                      label = 'Email';
                      break;
                    case 'request_id':
                      label = 'Request ID';
                      break;
                    case 'serial':
                      label = 'Số serial';
                      break;
                     case 'telco':
                      label = 'Nhà mạng';
                      break;
                    default:
                      // Capitalize first letter for other keys
                      label = key.charAt(0).toUpperCase() + key.slice(1);
                  }

                  // Handle object values (nested details) recursively or as string
                  if (typeof value === 'object' && value !== null) {
                     displayValue = JSON.stringify(value);
                  }

                  return (
                    <InfoRow 
                        key={key} 
                        label={label} 
                        value={displayValue} 
                        copyable={['request_id', 'serial', 'targetUser'].includes(key)}
                        fieldName={key}
                    />
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground italic text-center py-2">
                    Không có thông tin chi tiết
                </div>
              )}
            </div>
          </div>

           {/* Time */}
           <div className="text-xs text-muted-foreground text-center">
                Thời gian ghi nhận: {new Date(log.createdAt).toLocaleString('vi-VN')}
           </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
