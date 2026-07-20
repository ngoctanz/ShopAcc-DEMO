'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Upload, X } from 'lucide-react';
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

// Schema for Create Account (credentials required)
const createAccountSchema = z.object({
  packageId: z.string().min(1, 'Vui lòng chọn gói tài khoản'),
  accountInfo: z.string().min(1, 'Thông tin tài khoản là bắt buộc').max(500),
  price: z.coerce.number().min(1, 'Giá tối thiểu là 1đ'),
  originalPrice: z.coerce.number().min(1).nullable().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'LOCKED']),

  // Featured Skins
  featuredSkins: z.string().optional(),

  // Credentials - required for create
  username: z.string().min(1, 'Tài khoản đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  additionalInfo: z.string().optional(),

  // Images handled by state
  coverImage: z.any().optional(),
  images: z.any().optional(),
});

// Schema for Update Account (credentials optional)
const updateAccountSchema = z.object({
  packageId: z.string().min(1, 'Vui lòng chọn gói tài khoản'),
  accountInfo: z.string().min(1, 'Thông tin tài khoản là bắt buộc').max(500),
  price: z.coerce.number().min(1, 'Giá tối thiểu là 1đ'),
  originalPrice: z.coerce.number().min(1).nullable().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'LOCKED']),

  // Featured Skins
  featuredSkins: z.string().optional(),

  // Credentials - optional for update
  username: z.string().optional(),
  password: z.string().optional(),
  additionalInfo: z.string().optional(),

  // Images handled by state
  coverImage: z.any().optional(),
  images: z.any().optional(),
});

type ListFormValues = z.infer<typeof createAccountSchema>;

interface ListAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any | null;
}

export default function ListAccountModal({
  open,
  onOpenChange,
  data: editingItem,
}: ListAccountModalProps) {
  const queryClient = useQueryClient();

  // Fetch Packages
  const { data: allPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
    staleTime: 60 * 1000, // 1 minute
  });

  const packages = useMemo(() => allPackages.filter((p: any) => p.mode === 'LIST'), [allPackages]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListFormValues>({
    resolver: zodResolver(editingItem ? updateAccountSchema : createAccountSchema) as any,
    defaultValues: {
      status: 'AVAILABLE',
      price: 0,
      originalPrice: null,
      username: '',
      password: '',
      additionalInfo: '',
      accountInfo: '',
      featuredSkins: '',
      packageId: '',
      coverImage: null, // Not used directly by form
      images: null,     // Not used directly by form
    },
  });

  // Cover Image State
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [keptCoverImage, setKeptCoverImage] = useState<string>('');
  
  // Detail Images State
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [showCredentials, setShowCredentials] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [_fetchedCredentials, setFetchedCredentials] = useState<any>(null);

  useEffect(() => {
    if (open) {
      // Only reset when open
      setShowCredentials(false);
      setFetchedCredentials(null);

      if (editingItem) {
        // Find matching package by packageId
        const matchingPackage = packages.find((p: any) => {
          // editingItem.packageId can be string (ID) or object (populated)
          const packageId =
            typeof editingItem.packageId === 'string'
              ? editingItem.packageId
              : editingItem.packageId?._id;
          return p._id === packageId;
        });

        reset({
          packageId: matchingPackage ? matchingPackage._id : '',
          price: editingItem.price ?? 0,
          originalPrice: editingItem.originalPrice ?? null,
          accountInfo: editingItem.accountInfo || '',
          status: editingItem.status || 'AVAILABLE',
          featuredSkins: Array.isArray(editingItem.featuredSkins)
            ? editingItem.featuredSkins.join(', ')
            : '',
          username: '',
          password: '',
          additionalInfo: '',
        });
        
        // Setup initial images state
        setKeptCoverImage(editingItem.coverImage || '');
        setSelectedCoverFile(null);
        
        setKeptImages(editingItem.images || []);
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
          featuredSkins: '',
          packageId: '',
        });
        setKeptCoverImage('');
        setSelectedCoverFile(null);
        setKeptImages([]);
        setSelectedFiles([]);
      }
    }
  }, [editingItem, open, packages, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => accountService.createAccount(data),
    onSuccess: () => {
      toast.success('Thêm tài khoản List thành công');
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

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeKeptImage = (index: number) => {
    setKeptImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ListFormValues) => {
    const selectedPackage = packages.find((p: any) => p._id === data.packageId);
    if (!selectedPackage) {
      toast.error('Gói tài khoản không hợp lệ');
      return;
    }

    const formData = new FormData();
    // Use the Package ID
    formData.append('packageId', selectedPackage._id);
    // Use the Type ID from the selected package
    formData.append('typeId', (selectedPackage.typeId as any)?._id || selectedPackage.typeId);

    formData.append('accountInfo', data.accountInfo);
    formData.append('price', String(data.price));

    // Only send originalPrice when editing and it has a value
    if (editingItem && data.originalPrice !== null && data.originalPrice !== undefined) {
      formData.append('originalPrice', String(data.originalPrice));
    }

    formData.append('status', data.status);

    // Convert featuredSkins string to array
    if (data.featuredSkins?.trim()) {
      const skinsArray = data.featuredSkins
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      formData.append('featuredSkins', JSON.stringify(skinsArray));
    }

    // Only send credentials if they are provided (for update, only when changed)
    if (editingItem) {
      // For update: only send credentials if user has loaded and modified them
      if (showCredentials && (data.username || data.password)) {
        formData.append(
          'credentials',
          JSON.stringify({
            username: data.username,
            password: data.password,
            additionalInfo: data.additionalInfo,
          })
        );
      }
    } else {
      // For create: always send credentials (required)
      formData.append(
        'credentials',
        JSON.stringify({
          username: data.username,
          password: data.password,
          additionalInfo: data.additionalInfo,
        })
      );
    }

    // Append cover image
    // Priority: New File > Kept Old URL
    if (selectedCoverFile) {
      formData.append('coverImage', selectedCoverFile);
    } else if (keptCoverImage) {
      formData.append('coverImage', keptCoverImage);
    }

    // Append new files
    selectedFiles.forEach((file) => {
        formData.append('images', file);
    });

    // Append preserved existing images
    keptImages.forEach((url) => {
        formData.append('images', url);
    });

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Sửa Tài khoản (List)' : 'Thêm Tài khoản (List)'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label>
                Gói Tài khoản (List) <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="packageId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                      <SelectValue placeholder="Chọn gói" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((p: any) => (
                        <SelectItem key={p._id} value={p._id} className="truncate max-w-[300px]">
                          {p.title}
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

          <div className="space-y-2">
            <Label>
              Thông tin hiển thị (Public) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('accountInfo')}
              placeholder="Mô tả tài khoản..."
              rows={3}
              className="resize-none"
            />
            {errors.accountInfo && (
              <p className="text-red-500 text-xs">{errors.accountInfo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tướng/Skin nổi bật (tùy chọn)</Label>
            <Input {...register('featuredSkins')} placeholder="Các skin nổi bật..." />
            <p className="text-xs text-muted-foreground">
              Nhập tên các tướng/skin, phân cách bởi dấu phẩy
            </p>
            {errors.featuredSkins && (
              <p className="text-red-500 text-xs">{errors.featuredSkins.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                {...register('price')}
                min={0}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
              {!editingItem && (
                <p className="text-xs text-muted-foreground">
                  Giá sẽ tự động áp dụng giảm giá nếu có chương trình đang hoạt động
                </p>
              )}
            </div>
            {editingItem && (
              <div className="space-y-2">
                <Label>Giá gốc</Label>
                <Input
                  type="number"
                  {...register('originalPrice')}
                  min={0}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-muted-foreground">Để trống nếu không thay đổi</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ảnh đại diện (Cover Image)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedCoverFile(e.target.files[0]);
                    e.target.value = ''; // Reset input to allow re-selection
                  }
                }}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Chọn ảnh đại diện</p>
            </div>

            {/* Preview Cover Image */}
            {selectedCoverFile ? (
               <div className="mt-4">
                 <p className="text-xs text-muted-foreground mb-2">Ảnh đại diện mới:</p>
                 <div className="relative w-full max-w-xs aspect-video rounded-md overflow-hidden border group">
                   <img
                     src={URL.createObjectURL(selectedCoverFile)}
                     alt="Cover Preview"
                     className="w-full h-full object-cover"
                     onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                   />
                   <button
                     type="button"
                     onClick={() => setSelectedCoverFile(null)}
                     className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                     title="Xóa ảnh này"
                   >
                     <X className="h-4 w-4" />
                   </button>

                 </div>
               </div>
            ) : keptCoverImage ? (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Ảnh đại diện hiện tại:</p>
                <div className="relative w-full max-w-xs aspect-video rounded-md overflow-hidden border group">
                  <img
                    src={keptCoverImage}
                    alt="Current Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setKeptCoverImage('')}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Xóa ảnh này"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh minh họa (Tối đa 6 ảnh)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const newFiles = Array.from(e.target.files);
                    const totalImages = keptImages.length + selectedFiles.length + newFiles.length;

                    if (totalImages > 6) {
                      toast.error('Chỉ được phép tải lên tối đa 6 ảnh minh họa');
                      e.target.value = ''; // Reset input
                      return;
                    }

                    setSelectedFiles(prev => [...prev, ...newFiles]);
                    e.target.value = ''; // Allow duplicate selection
                  }
                }}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Chọn ảnh</p>
            </div>
            
            {(selectedFiles.length > 0) && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Đã thêm {selectedFiles.length} file mới
              </div>
            )}

            {(keptImages.length > 0 || selectedFiles.length > 0) && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Kept Images */}
                  {keptImages.map((img: string, idx: number) => (
                    <div
                      key={`kept-${idx}`}
                      className="relative aspect-square rounded-md overflow-hidden border group"
                    >
                      <img src={img} alt="Account" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeKeptImage(idx)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>

                    </div>
                  ))}
                  
                  {/* Selected Files Preview */}
                  {selectedFiles.map((file, idx) => (
                    <div
                        key={`new-${idx}`}
                        className="relative aspect-square rounded-md overflow-hidden border group"
                    >
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                        />
                        <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <X className="h-3 w-3" />
                        </button>

                    </div>
                  ))}
                </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-bold flex items-center gap-2">
                  Thông tin đăng nhập (Secure)
                </Label>
                {editingItem && !showCredentials && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Không cần thay đổi? Bỏ qua phần này.
                  </p>
                )}
              </div>
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
                      <Eye className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Username
                  {!editingItem && <span className="text-red-500">*</span>}
                </Label>
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
                <Label>
                  Password
                  {!editingItem && <span className="text-red-500">*</span>}
                </Label>
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
