'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { packageService } from '@/services/account-package.service';

// Schema definition
const schema = z.object({
  title: z.string().min(1, 'Tên gói là bắt buộc').max(100),
  description: z.string().optional(),
  typeId: z.string().min(1, 'Vui lòng chọn danh mục'),
  mode: z.enum(['LIST', 'RANDOM', 'CLONE']),
  price: z.coerce.number().min(0).nullable().optional(), // Optional for CLONE mode
  discountPrice: z
    .any()
    .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val)))
    .refine((val) => val === null || (!Number.isNaN(val) && val >= 1), {
      message: 'Giá khuyến mãi tối thiểu là 1đ',
    }),
  priceRangeMin: z.coerce.number().min(1).nullable().optional(),
  priceRangeMax: z.coerce.number().min(1).nullable().optional(),
  image: z.any().optional(),
  order: z.coerce.number().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface AccountPackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any | null;
}

export default function AccountPackageModal({
  open,
  onOpenChange,
  data: editingItem,
}: AccountPackageModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      mode: 'LIST',
      isActive: true,
      order: 0,
    },
  });

  const watchMode = watch('mode');
  const watchImage = watch('image');

  // Fetch Types for Select
  const { data: types = [] } = useQuery({
    queryKey: ['types'],
    queryFn: () => packageService.getAccountTypes(),
  });

  // Reset form when editingItem changes
  useEffect(() => {
    if (editingItem) {
      reset({
        ...editingItem,
        typeId: editingItem.typeId?._id || editingItem.typeId,
        priceRangeMin: editingItem.priceRange?.min,
        priceRangeMax: editingItem.priceRange?.max,
      });
    } else {
      reset({
        mode: 'LIST',
        isActive: true,
        order: 0,
        title: '',
        description: '',
        typeId: '',
        price: 0,
        discountPrice: null,
        priceRangeMin: null,
        priceRangeMax: null,
        image: null,
      });
    }
  }, [editingItem, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormData) => packageService.createPackage(data),
    onSuccess: () => {
      toast.success('Thêm gói thành công');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi thêm gói'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      packageService.updatePackage(id, data),
    onSuccess: () => {
      toast.success('Cập nhật gói thành công');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi cập nhật gói'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('typeId', data.typeId);
    formData.append('mode', data.mode);
    formData.append('isActive', String(data.isActive));
    formData.append('order', String(data.order));

    // Only send price for RANDOM mode
    if (data.mode === 'RANDOM' && data.price) {
      formData.append('price', String(data.price));
      // Chỉ gửi discountPrice nếu có giá trị hợp lệ
      if (
        data.discountPrice !== null &&
        data.discountPrice !== undefined &&
        !Number.isNaN(data.discountPrice)
      ) {
        formData.append('discountPrice', String(data.discountPrice));
      }
    }

    // Price range only for RANDOM mode
    if (data.mode === 'RANDOM') {
      if (data.priceRangeMin !== null && data.priceRangeMin !== undefined)
        formData.append('priceRange[min]', String(data.priceRangeMin));
      if (data.priceRangeMax !== null && data.priceRangeMax !== undefined)
        formData.append('priceRange[max]', String(data.priceRangeMax));
    }

    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Chỉnh sửa Gói' : 'Thêm mới Gói'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Danh mục tài khoản</Label>
              <Controller
                control={control}
                name="typeId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t: any) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.typeId && <p className="text-red-500 text-xs">{errors.typeId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Chế độ</Label>
              <Controller
                control={control}
                name="mode"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIST">LIST (Danh sách)</SelectItem>
                      <SelectItem value="RANDOM">RANDOM (Vận may)</SelectItem>
                      <SelectItem value="CLONE">CLONE (Clone)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tên Gói</Label>
            <Input {...register('title')} />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả gói</Label>
            <Textarea
              {...register('description')}
              placeholder="Mô tả ngắn hiển thị bên dưới tiêu đề..."
              rows={2}
            />
          </div>

          {watchMode === 'RANDOM' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá bán (VNĐ)</Label>
                <Input
                  type="number"
                  {...register('price')}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Giá khuyến mãi (VNĐ)</Label>
                <Input
                  type="number"
                  {...register('discountPrice')}
                  disabled
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Giá khuyến mãi sau khi áp dụng giảm giá
                </p>
              </div>
            </div>
          )}

          {watchMode === 'RANDOM' && (
            <div className="border p-4 rounded-lg bg-muted/20 space-y-4">
              <Label className="font-bold">Khoảng giá lọc Random</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  {...register('priceRangeMin')}
                  placeholder="Min"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  type="number"
                  {...register('priceRangeMax')}
                  placeholder="Max"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Ảnh đại diện</Label>
            <div className="flex flex-col gap-3">
              {watchImage && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                  <img
                    src={watchImage instanceof File ? URL.createObjectURL(watchImage) : watchImage}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('image', null, { shouldDirty: true })}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-colors"
                    title="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*.png,image/*.jpg,image/*.jpeg,image/*.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setValue('image', file, { shouldDirty: true });
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Checkbox id="isActive" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="isActive">Kích hoạt hiển thị</Label>
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
              {isPending || isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
