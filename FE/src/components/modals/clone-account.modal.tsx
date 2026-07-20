'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { accountService } from '@/services/account.service';
import { packageService } from '@/services/account-package.service';
import type { Account } from '@/types/index.type';

interface CloneAccount {
  username: string;
  password: string;
  additionalInfo?: string;
}

interface CloneAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAccount?: Account | null;
}

export default function CloneAccountModal({
  open,
  onOpenChange,
  editingAccount,
}: CloneAccountModalProps) {
  const queryClient = useQueryClient();

  // Form state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [accountInfo, setAccountInfo] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [cloneAccounts, setCloneAccounts] = useState<CloneAccount[]>([
    { username: '', password: '', additionalInfo: '' },
  ]);

  // Fetch CLONE packages
  const { data: allPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
    staleTime: 60 * 1000,
  });

  const packages = allPackages.filter((p: any) => p.mode === 'CLONE');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editingAccount) {
        // Edit mode - populate form
        setSelectedPackageId((editingAccount as any).packageId?._id || '');
        setAccountInfo(editingAccount.accountInfo || '');
        setPrice(editingAccount.price || 0);
        // Load existing clone accounts would require API call
        setCloneAccounts([{ username: '', password: '', additionalInfo: '' }]);
      } else {
        // Create mode - reset form
        setSelectedPackageId('');
        setAccountInfo('');
        setPrice(0);
        setCloneAccounts([{ username: '', password: '', additionalInfo: '' }]);
      }
    }
  }, [open, editingAccount]);

  // Add new clone account row
  const addCloneAccountRow = () => {
    setCloneAccounts([...cloneAccounts, { username: '', password: '', additionalInfo: '' }]);
  };

  // Remove clone account row
  const removeCloneAccountRow = (index: number) => {
    if (cloneAccounts.length > 1) {
      setCloneAccounts(cloneAccounts.filter((_, i) => i !== index));
    }
  };

  // Update clone account field
  const updateCloneAccount = (index: number, field: keyof CloneAccount, value: string) => {
    const updated = [...cloneAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setCloneAccounts(updated);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { accountData: any; cloneAccounts: CloneAccount[] }) =>
      accountService.createCloneAccount(data.accountData, data.cloneAccounts),
    onSuccess: () => {
      toast.success('Đã tạo tài khoản clone thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo tài khoản'),
  });

  // Add to existing account mutation
  const addToExistingMutation = useMutation({
    mutationFn: (data: { accountId: string; accounts: CloneAccount[] }) =>
      accountService.addCloneAccounts(data.accountId, data.accounts),
    onSuccess: (data) => {
      toast.success(`Đã thêm ${data.addedCount} tài khoản con`);
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi thêm tài khoản'),
  });

  const handleSubmit = () => {
    if (!selectedPackageId) {
      toast.error('Vui lòng chọn gói tài khoản');
      return;
    }

    // Filter valid clone accounts
    const validCloneAccounts = cloneAccounts.filter(
      (acc) => acc.username.trim() && acc.password.trim()
    );

    if (validCloneAccounts.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 tài khoản con');
      return;
    }

    if (!price || price < 1) {
      toast.error('Vui lòng nhập giá bán');
      return;
    }

    if (editingAccount) {
      // Add to existing account
      addToExistingMutation.mutate({
        accountId: editingAccount._id,
        accounts: validCloneAccounts,
      });
    } else {
      // Create new clone account
      createMutation.mutate({
        accountData: {
          packageId: selectedPackageId,
          accountInfo: accountInfo || `Clone Account (${validCloneAccounts.length} acc)`,
          price,
        },
        cloneAccounts: validCloneAccounts,
      });
    }
  };

  const isPending = createMutation.isPending || addToExistingMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAccount ? 'Thêm tài khoản con' : 'Tạo tài khoản Clone mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          {!editingAccount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Chọn Gói <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn gói Clone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p: any) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="VD: 10000"
                />
              </div>
            </div>
          )}

          {/* Account Info */}
          {!editingAccount && (
            <div className="space-y-2">
              <Label>Mô tả tài khoản</Label>
              <Input
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                placeholder="VD: Clone Full Tướng, Clone Trắng..."
              />
            </div>
          )}

          {/* Clone Accounts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Danh sách tài khoản con</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCloneAccountRow}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm dòng
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {cloneAccounts.map((acc, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center text-sm text-muted-foreground font-mono">
                    {index + 1}
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Username *"
                      value={acc.username}
                      onChange={(e) => updateCloneAccount(index, 'username', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Password *"
                      value={acc.password}
                      onChange={(e) => updateCloneAccount(index, 'password', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Info"
                      value={acc.additionalInfo || ''}
                      onChange={(e) => updateCloneAccount(index, 'additionalInfo', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeCloneAccountRow(index)}
                      disabled={cloneAccounts.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              * Username và Password là bắt buộc. Info là thông tin thêm (2FA, backup, ghi chú...).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingAccount ? 'Thêm tài khoản con' : 'Tạo tài khoản'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
