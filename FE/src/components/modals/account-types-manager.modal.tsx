'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { packageService } from '@/services/account-package.service';
import type { AccountType } from '@/types/index.type';

const schema = z.object({
  code: z.string().min(1, 'Mã danh mục là bắt buộc').max(20, 'Mã tối đa 20 ký tự'),
  name: z.string().min(1, 'Tên danh mục là bắt buộc').max(100, 'Tên tối đa 100 ký tự'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface AccountTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AccountType | null;
}

export default function AccountTypeModal({
  open,
  onOpenChange,
  data: editingItem,
}: AccountTypeModalProps) {
  const queryClient = useQueryClient();

  // Setup Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Reset form when editingItem changes
  useEffect(() => {
    if (editingItem) {
      reset({
        code: editingItem.code,
        name: editingItem.name,
        description: editingItem.description || '',
        isActive: editingItem.isActive,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [editingItem, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormData) => packageService.createAccountType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-types'] });
      toast.success('Tạo danh mục thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      packageService.updateAccountType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-types'] });
      toast.success('Cập nhật danh mục thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormData) => {
    const formattedData = {
      ...data,
      code: data.code.toUpperCase(), // Ensure uppercase code
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Chỉnh sửa Danh mục' : 'Thêm mới Danh mục'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Mã Danh mục (Code)</Label>
            <Input
              {...register('code')}
              placeholder="VD: ACC REG, ACC RANK..."
              disabled={!!editingItem}
            />
            {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tên Danh mục</Label>
            <Input {...register('name')} placeholder="VD: ACC REG RANK CAO,..." />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea {...register('description')} placeholder="Mô tả về loại tài khoản này..." />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Kích hoạt hiển thị
            </Label>
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
            <Button type="submit" disabled={isSubmitting || isPending}>
              {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting || isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
