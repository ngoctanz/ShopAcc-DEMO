'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Mail, Save, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useGlobalError } from '@/contexts/global-error-context';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

// Schema for change password
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function UserProfileSection() {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const { showError } = useGlobalError();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Handle password change
  const onSubmit = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      reset();
      setShowPasswordForm(false);
      // Logout sau khi đổi mật khẩu thành công
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Đổi mật khẩu không thành công';
      showError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Safe checks if user is loading or not exists
  if (!user) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8 md:py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin tài khoản</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <span className="text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </p>

              <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Số dư:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(user.balance)}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Online cuối:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Security */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Thông tin cơ bản
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 sm:text-sm focus:ring-0 focus:border-gray-300 cursor-not-allowed opacity-60"
                      value={user.name}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 sm:text-sm focus:ring-0 focus:border-gray-300 cursor-not-allowed opacity-60"
                      value={user.email}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Đổi mật khẩu
              </h3>
            </div>

            {!showPasswordForm ? (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Để bảo mật tài khoản, vui lòng thay đổi mật khẩu định kỳ. Mật khẩu mới cần có ít
                  nhất 6 ký tự.
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Thay đổi mật khẩu
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    {...register('oldPassword')}
                    className={`w-full px-4 py-2 bg-transparent border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      errors.oldPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.oldPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.oldPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      {...register('newPassword')}
                      className={`w-full px-4 py-2 bg-transparent border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        errors.newPassword
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...register('confirmPassword')}
                      className={`w-full px-4 py-2 bg-transparent border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>Cập nhật</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      reset();
                    }}
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
