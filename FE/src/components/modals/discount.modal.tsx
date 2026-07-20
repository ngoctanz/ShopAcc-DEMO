'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { type Discount, discountService } from '@/services/discount.service';

const today = new Date().toISOString().split('T')[0];

const discountSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải có ít nhất 2 ký tự').max(100),
  description: z.string().max(500).optional(),
  discountPercent: z.coerce
    .number()
    .min(0, 'Phần trăm giảm không được âm')
    .max(100, 'Phần trăm giảm không được vượt quá 100'),
  applicablePackages: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 gói'),
  endDate: z
    .string()
    .refine(
      (date) => {
        if (!date) return true;
        return date >= today;
      },
      { message: 'Ngày kết thúc phải từ hôm nay trở đi' }
    )
    .optional(),
  isActive: z.boolean(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Discount | null;
}

export default function DiscountModal({
  open,
  onOpenChange,
  data: editingItem,
}: DiscountModalProps) {
  const queryClient = useQueryClient();

  // Fetch all packages
  const { data: allPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
    staleTime: 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      title: '',
      description: '',
      discountPercent: 0,
      applicablePackages: [],
      endDate: '',
      isActive: true,
    },
  });

  const watchPackages = watch('applicablePackages');

  useEffect(() => {
    if (open) {
      if (editingItem) {
        const packageIds = Array.isArray(editingItem.applicablePackages)
          ? editingItem.applicablePackages.map((p: any) => (typeof p === 'string' ? p : p._id))
          : [];

        reset({
          title: editingItem.title,
          description: editingItem.description || '',
          discountPercent: editingItem.discountPercent,
          applicablePackages: packageIds,
          endDate: editingItem.endDate
            ? new Date(editingItem.endDate).toISOString().split('T')[0]
            : '',
          isActive: editingItem.isActive,
        });
      } else {
        reset({
          title: '',
          description: '',
          discountPercent: 0,
          applicablePackages: [],
          endDate: '',
          isActive: true,
        });
      }
    }
  }, [editingItem, open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => discountService.createDiscount(data),
    onSuccess: () => {
      toast.success('Tạo chương trình giảm giá thành công');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo chương trình giảm giá'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      discountService.updateDiscount(id, data),
    onSuccess: () => {
      toast.success('Cập nhật chương trình giảm giá thành công');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: DiscountFormValues) => {
    const payload = {
      ...data,
      endDate: data.endDate || undefined,
    };

    console.log('Submitting discount:', payload);

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handlePackageToggle = (packageId: string) => {
    const current = watchPackages || [];
    const updated = current.includes(packageId)
      ? current.filter((id) => id !== packageId)
      : [...current, packageId];
    setValue('applicablePackages', updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Sửa Chương trình giảm giá' : 'Tạo Chương trình giảm giá'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input {...register('title')} placeholder="Ví dụ: Giảm giá mùa hè" />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              {...register('description')}
              placeholder="Mô tả chi tiết về chương trình..."
              rows={3}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Phần trăm giảm (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              {...register('discountPercent')}
              min={0}
              max={100}
              placeholder="Ví dụ: 20"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.discountPercent && (
              <p className="text-red-500 text-xs">{errors.discountPercent.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ngày kết thúc (tùy chọn)</Label>
            <Input type="date" {...register('endDate')} min={today} />
            {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate.message}</p>}
            <p className="text-xs text-muted-foreground">Để trống nếu không có thời hạn</p>
          </div>

          <div className="space-y-2">
            <Label>
              Áp dụng cho các gói <span className="text-red-500">*</span>
            </Label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {allPackages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có gói nào</p>
              ) : (
                allPackages.map((pkg: any) => (
                  <div key={pkg._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={pkg._id}
                      checked={watchPackages?.includes(pkg._id)}
                      onCheckedChange={() => handlePackageToggle(pkg._id)}
                    />
                    <label
                      htmlFor={pkg._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {pkg.title} ({pkg.mode})
                    </label>
                  </div>
                ))
              )}
            </div>
            {errors.applicablePackages && (
              <p className="text-red-500 text-xs">{errors.applicablePackages.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Checkbox id="isActive" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
              Kích hoạt ngay
            </label>
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
              {editingItem ? 'Lưu' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
