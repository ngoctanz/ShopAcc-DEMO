'use client';

import { IconCheck, IconCopy, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService } from '@/services/user.service';

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserDetailModal({ open, onOpenChange, userId }: UserDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Balance update state
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: open && !!userId,
  });

  const updateBalanceMutation = useMutation({
    mutationFn: (data: { amount: number; action: 'add' | 'subtract'; reason: string }) =>
      userService.updateUserBalance(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật số dư thành công');
      setShowBalanceDialog(false);
      setAmount('');
      setReason('');
      setBalanceAction('add');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật số dư');
    },
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateBalance = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    updateBalanceMutation.mutate({
      amount: Number(amount),
      action: balanceAction,
      reason: reason,
    });
  };

  const InfoRow = ({
    label,
    value,
    copyable = false,
    fieldName = '',
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
    fieldName?: string;
  }) => (
    <div className="flex justify-between items-start py-3 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{value || 'N/A'}</span>
        {copyable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogDescription>Thông tin chi tiết về người dùng</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize ${user.role === 'admin' ? 'border-primary text-primary' : ''}`}
                >
                  {user.role}
                </Badge>
              </div>

              {/* Basic Information */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Thông tin cơ bản</h4>
                <div className="bg-card border rounded-lg p-4">
                  <InfoRow label="ID" value={user._id} copyable fieldName="id" />
                  <InfoRow label="Họ tên" value={user.name} />
                  <InfoRow label="Email" value={user.email} copyable fieldName="email" />
                  <InfoRow label="Số điện thoại" value={user.phone} copyable fieldName="phone" />
                  <InfoRow label="Vai trò" value={user.role} />
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                  Trạng thái tài khoản
                </h4>
                <div className="bg-card border rounded-lg p-4">
                  <InfoRow
                    label="Trạng thái"
                    value={
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <span>{user.status === 'active' ? 'Hoạt động' : 'Bị cấm'}</span>
                      </div>
                    }
                  />
                  <InfoRow 
                    label="Số dư" 
                    value={
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">{`${user.balance?.toLocaleString('vi-VN') || 0}đ`}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 ml-2 hover:bg-green-500/10 hover:text-green-600 cursor-pointer" 
                          onClick={() => {
                              setBalanceAction('add');
                              setShowBalanceDialog(true);
                          }}
                          title="Cộng/Trừ tiền"
                        >
                          <IconPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    } 
                  />
                  <InfoRow
                    label="Đăng nhập lần cuối"
                    value={
                      user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('vi-VN')
                        : 'Chưa đăng nhập'
                    }
                  />
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Thời gian</h4>
                <div className="bg-card border rounded-lg p-4">
                  <InfoRow
                    label="Ngày tạo"
                    value={user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  />
                  <InfoRow
                    label="Cập nhật lần cuối"
                    value={user.updatedAt ? new Date(user.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy thông tin người dùng
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Update Dialog */}
      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật số dư</DialogTitle>
            <DialogDescription>
              Thay đổi số dư cho tài khoản <b>{user?.name}</b>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Hành động</Label>
              <Select value={balanceAction} onValueChange={(val: any) => setBalanceAction(val)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Cộng tiền (+)</SelectItem>
                  <SelectItem value="subtract">Trừ tiền (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Số tiền</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="Nhập số tiền..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Lý do</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="col-span-3"
                placeholder="Nhập lý do thay đổi số dư..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateBalance} disabled={updateBalanceMutation.isPending}>
              {updateBalanceMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
