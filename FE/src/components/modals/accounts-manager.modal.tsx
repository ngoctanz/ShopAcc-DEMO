'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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

// Schema
const schema = z.object({
  typeId: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  originalPrice: z.coerce.number().min(0).nullable().optional(),
  accountInfo: z.string().min(1, 'Thông tin tài khoản là bắt buộc').max(500),
  status: z.enum(['AVAILABLE', 'SOLD', 'LOCKED']),

  // Credentials
  username: z.string().min(1, 'Tài khoản đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  additionalInfo: z.string().optional(),

  // Images logic handled separately via state
  images: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any | null;
}

export default function AccountModal({ open, onOpenChange, data: editingItem }: AccountModalProps) {
  const queryClient = useQueryClient();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'AVAILABLE',
      price: 0,
      originalPrice: null,
      username: '',
      password: '',
      additionalInfo: '',
      accountInfo: '',
      images: null,
    },
  });

  // Fetch Types
  const { data: types = [] } = useQuery({
    queryKey: ['account-types'],
    queryFn: () => packageService.getAccountTypes(),
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        typeId: editingItem.typeId?._id || editingItem.typeId,
        price: editingItem.price,
        originalPrice: editingItem.originalPrice,
        accountInfo: editingItem.accountInfo,
        status: editingItem.status,
        username: editingItem.credentials?.username || '',
        password: editingItem.credentials?.password || '',
        additionalInfo: editingItem.credentials?.additionalInfo || '',
      });
      setExistingUrls(editingItem.images || []);
      setSelectedFiles([]);
    } else {
      reset({
        status: 'AVAILABLE',
        price: 0,
        originalPrice: null,
        username: '',
        password: '',
        additionalInfo: '',
        accountInfo: '',
        typeId: '',
        images: null,
      });
      setExistingUrls([]);
      setSelectedFiles([]);
    }
  }, [editingItem, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => accountService.createAccount(data),
    onSuccess: () => {
      toast.success('Thêm tài khoản thành công');
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

  const onSubmit = (data: FormValues) => {
    // Construct FormData
    const formData = new FormData();
    formData.append('typeId', data.typeId);
    formData.append('accountInfo', data.accountInfo);
    formData.append('price', String(data.price));
    if (data.originalPrice !== null && data.originalPrice !== undefined) {
      formData.append('originalPrice', String(data.originalPrice));
    }
    formData.append('status', data.status);

    formData.append(
      'credentials',
      JSON.stringify({
        username: data.username,
        password: data.password,
        additionalInfo: data.additionalInfo,
      })
    );

    // Handle images: Append both existing URLs and new Files
    existingUrls.forEach((url) => {
        formData.append('images', url);
    });

    selectedFiles.forEach((file) => {
        formData.append('images', file);
    });

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (index: number) => {
      setExistingUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Chỉnh sửa Tài khoản' : 'Thêm mới Tài khoản'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label>
                Danh mục Game <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="typeId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!editingItem}
                  >
                    <SelectTrigger className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t: any) => (
                        <SelectItem key={t._id} value={t._id} className="truncate max-w-[300px]">
                          {t.name} ({t.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.typeId && <p className="text-red-500 text-xs">{errors.typeId.message}</p>}
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

          <div className="space-y-2">
            <Label>
              Thông tin hiển thị (Public) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('accountInfo')}
              placeholder="Mô tả ngắn gọn về tài khoản (VD: Full Skin 2024, Rank KC...)"
              rows={3}
              className="resize-none"
            />
            {errors.accountInfo && (
              <p className="text-red-500 text-xs">{errors.accountInfo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input type="number" {...register('price')} min={0} />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Giá gốc</Label>
              <Input type="number" {...register('originalPrice')} min={0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh minh họa</Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                     setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                     // Reset input value to allow selecting same file again
                     e.target.value = '';
                  }
                }}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Bấm để chọn thêm ảnh</p>
              <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP</p>
            </div>
            
            {(existingUrls.length > 0 || selectedFiles.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingUrls.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative group aspect-square rounded-md overflow-hidden border bg-background">
                    <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingUrl(idx)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Xóa ảnh này"
                    >
                      <X size={14} />
                    </button>

                  </div>
                ))}
                
                {/* New Files */}
                {selectedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative group aspect-square rounded-md overflow-hidden border bg-background">
                    <img 
                        src={URL.createObjectURL(file)} 
                        alt={`New ${idx}`} 
                        className="w-full h-full object-cover" 
                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} // Cleanup memory
                    />
                     <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Xóa ảnh này"
                    >
                      <X size={14} />
                    </button>

                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
                Tổng cộng: {existingUrls.length + selectedFiles.length} ảnh
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <Label className="font-bold flex items-center gap-2">
              Thông tin tài khoản
              <span className="text-xs font-normal text-muted-foreground">
                (Chỉ hiển thị với Admin & Người mua)
              </span>
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input {...register('username')} placeholder="Tài khoản đăng nhập" />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input {...register('password')} placeholder="Mật khẩu" />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thông tin thêm (2FA, Email backup...)</Label>
              <Textarea {...register('additionalInfo')} placeholder="Thông tin bảo mật khác..." />
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
              {editingItem ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
