'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { accountService } from '@/services/account.service';
import { packageService } from '@/services/account-package.service';

// Schema for Random Account (Simplified)
// Schema for Create Random Account
const createRandomAccountSchema = z.object({
  packageId: z.string().min(1, 'Vui lòng chọn gói tài khoản'),
  status: z.enum(['AVAILABLE', 'SOLD', 'LOCKED']).default('AVAILABLE'),
  username: z.string().min(1, 'Tài khoản đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  additionalInfo: z.string().optional(),
});

// Schema for Update Random Account
const updateRandomAccountSchema = z.object({
  packageId: z.string().min(1, 'Vui lòng chọn gói tài khoản'),
  status: z.enum(['AVAILABLE', 'SOLD', 'LOCKED']).default('AVAILABLE'),
  username: z.string().optional(),
  password: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type RandomFormValues = z.infer<typeof createRandomAccountSchema>;

interface RandomAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any | null;
  mode?: 'RANDOM' | 'CLONE';
}

export default function RandomAccountModal({
  open,
  onOpenChange,
  data: editingItem,
  mode = 'RANDOM',
}: RandomAccountModalProps) {
  const queryClient = useQueryClient();

  // Fetch Packages
  const { data: allPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
    staleTime: 60 * 1000,
  });

  const packages = useMemo(
    () => allPackages.filter((p: any) => p.mode === mode),
    [allPackages, mode]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RandomFormValues>({
    resolver: zodResolver(
      editingItem ? updateRandomAccountSchema : createRandomAccountSchema
    ) as any,
    defaultValues: {
      status: 'AVAILABLE',
      username: '',
      password: '',
      additionalInfo: '',
      packageId: '',
    },
  });

  const [showCredentials, setShowCredentials] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [_fetchedCredentials, setFetchedCredentials] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setShowCredentials(false);
      setFetchedCredentials(null);

      if (editingItem) {
        const matchingPackage = packages.find(
          (p: any) => p.typeId._id === editingItem.typeId?._id || p.typeId === editingItem.typeId
        );
        reset({
          packageId: matchingPackage ? matchingPackage._id : '',
          status: editingItem.status || 'AVAILABLE',
          username: '', // Don't pre-fill to avoid partial overwrite risk if not loaded
          password: '',
          additionalInfo: '',
        });
      } else {
        reset({
          status: 'AVAILABLE',
          username: '',
          password: '',
          additionalInfo: '',
          packageId: '',
        });
      }
    }
  }, [editingItem, open, packages, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => accountService.createAccount(data),
    onSuccess: () => {
      toast.success(`Thêm tài khoản ${mode === 'CLONE' ? 'Clone' : 'Random'} thành công`);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi thêm tài khoản'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      accountService.updateAccount(id, data),
    onSuccess: () => {
      toast.success('Cập nhật tài khoản thành công');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleToggleCredentials = async () => {
    if (showCredentials) {
      setShowCredentials(false);
    } else if (editingItem?._id) {
      setLoadingCredentials(true);
      try {
        const accountWithCreds = await accountService.getAccountCredentials(editingItem._id);
        setFetchedCredentials(accountWithCreds.credentials);
        setValue('username', accountWithCreds.credentials?.username || '');
        setValue('password', accountWithCreds.credentials?.password || '');
        setValue('additionalInfo', accountWithCreds.credentials?.additionalInfo || '');
        setShowCredentials(true);
        toast.success('Đã tải thông tin đăng nhập');
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải thông tin đăng nhập');
      } finally {
        setLoadingCredentials(false);
      }
    }
  };

  const onSubmit = (data: RandomFormValues) => {
    const selectedPackage = packages.find((p: any) => p._id === data.packageId);
    if (!selectedPackage) {
      toast.error('Gói tài khoản không hợp lệ');
      return;
    }

    const formData = new FormData();
    // Use explicit packageId to ensure correct package and price logic is triggered
    formData.append('packageId', selectedPackage._id);
    formData.append('typeId', (selectedPackage.typeId as any)?._id || selectedPackage.typeId);
    // Auto-fill required fields
    formData.append('accountInfo', selectedPackage.title || 'Random Account'); // Or package name
    formData.append('price', String(selectedPackage.price ?? 0)); // Use package price or 0
    if (selectedPackage.image) {
      formData.append('coverImage', selectedPackage.image);
      // Also add to images array so it appears in list if it uses images[0]
      formData.append('images', selectedPackage.image);
    }
    formData.append('status', data.status);

    if (editingItem) {
      // Only append credentials if they are provided (loaded/changed)
      if (data.username || data.password) {
        formData.append(
          'credentials',
          JSON.stringify({
            username: data.username,
            password: data.password,
            additionalInfo: data.additionalInfo,
          })
        );
      }
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      // Always append for create (required by schema)
      formData.append(
        'credentials',
        JSON.stringify({
          username: data.username,
          password: data.password,
          additionalInfo: data.additionalInfo,
        })
      );
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? `Sửa Tài khoản (${mode})` : `Thêm Tài khoản (${mode})`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label>
                Gói {mode === 'CLONE' ? 'Clone' : 'Random'} <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="packageId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                      <SelectValue
                        placeholder={`Chọn gói ${mode === 'CLONE' ? 'Clone' : 'Random'}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((p: any) => (
                        <SelectItem key={p._id} value={p._id} className="truncate max-w-[300px]">
                          {p.title} -{' '}
                          {p.discountPrice && p.discountPrice < p.price
                            ? `${p.discountPrice.toLocaleString()}đ (Gốc: ${p.price?.toLocaleString()}đ)`
                            : `${(p.discountPrice ?? p.price ?? 0).toLocaleString()}đ`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.packageId && (
                <p className="text-red-500 text-xs">{errors.packageId.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label>Trạng thái</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Sẵn sàng (Available)</SelectItem>
                      <SelectItem value="SOLD">Đã bán (Sold)</SelectItem>
                      <SelectItem value="LOCKED">Đang khóa (Locked)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold flex items-center gap-2">Thông tin đăng nhập</Label>
              {editingItem && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCredentials}
                  disabled={loadingCredentials}
                >
                  {loadingCredentials ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : showCredentials ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" /> Ẩn
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" /> Hiển thị
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username {!editingItem && <span className="text-red-500">*</span>}</Label>
                <Controller
                  control={control}
                  name="username"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Username"
                      value={editingItem && !showCredentials ? '••••••••' : field.value || ''}
                      disabled={editingItem && !showCredentials}
                      onChange={editingItem && !showCredentials ? undefined : field.onChange}
                    />
                  )}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Password {!editingItem && <span className="text-red-500">*</span>}</Label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Password"
                      value={editingItem && !showCredentials ? '••••••••' : field.value || ''}
                      disabled={editingItem && !showCredentials}
                      onChange={editingItem && !showCredentials ? undefined : field.onChange}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thông tin thêm</Label>
              <Controller
                control={control}
                name="additionalInfo"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="2FA, Backup..."
                    value={editingItem && !showCredentials ? '••••••••' : field.value || ''}
                    disabled={editingItem && !showCredentials}
                    onChange={editingItem && !showCredentials ? undefined : field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
