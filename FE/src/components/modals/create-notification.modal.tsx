'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Notification, notificationService } from '@/services/notification.service';

const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
  type: z.enum(['system', 'promotion', 'maintenance', 'news']),
  link: z.string().optional(),
});

interface CreateNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationToEdit?: Notification | null;
}

export function CreateNotificationModal({
  open,
  onOpenChange,
  notificationToEdit,
}: CreateNotificationModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!notificationToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'system',
      link: '',
    },
  });

  // Reset form when opening/closing or changing edit mode
  useEffect(() => {
    if (open) {
      if (notificationToEdit) {
        form.reset({
          title: notificationToEdit.title,
          message: notificationToEdit.message,
          type: notificationToEdit.type,
          link: notificationToEdit.link || '',
        });
      } else {
        form.reset({
          title: '',
          message: '',
          type: 'system',
          link: '',
        });
      }
    }
  }, [open, notificationToEdit, form]);

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      notificationService.createNotification(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Tạo thông báo thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo thông báo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      notificationService.updateNotification(notificationToEdit!._id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Cập nhật thông báo thành công');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật thông báo');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật nội dung thông báo hệ thống.'
              : 'Tạo thông báo mới gửi đến toàn bộ hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề thông báo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại thông báo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại thông báo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="system">Hệ thống</SelectItem>
                      <SelectItem value="promotion">Khuyến mãi</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                      <SelectItem value="news">Tin tức</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung thông báo..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liên kết (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>Đường dẫn khi người dùng nhấp vào thông báo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
