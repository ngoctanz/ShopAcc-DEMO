'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import ComingSoonModal from '@/components/modals/coming-soon.modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth-context';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';

// Định nghĩa schema validation
const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Định dạng email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Map các lỗi từ backend sang tiếng Việt
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng',
  'Invalid credentials': 'Thông tin đăng nhập không hợp lệ',
  'User not found': 'Tài khoản không tồn tại',
  'Account is banned': 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
  'Account is inactive': 'Tài khoản chưa được kích hoạt',
  'Network error': 'Lỗi kết nối mạng. Vui lòng thử lại.',
  'Too many requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
};

function translateError(error: string): string {
  return ERROR_MESSAGES[error] || error || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { setAuth } = useAuthContext();

  // Redirect if already authenticated (admin → dashboard, user → home)
  const { isLoading: isCheckingAuth } = useRedirectIfAuthenticated();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@gmail.com',
      password: '12345678',
    },
  });

  // Watch các trường để clear error khi user nhập
  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Clear error khi user thay đổi input
  useEffect(() => {
    if (error) {
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue, passwordValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setShakeError(false);

      const response = await authService.login(data);

      // Lưu auth state (user + accessToken)
      // Hook useRedirectIfAuthenticated sẽ tự động redirect dựa trên role
      setAuth(response.user, response.accessToken);
    } catch (err: any) {
      const errorMessage = translateError(err.message);
      setError(errorMessage);

      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="w-full max-w-sm mx-auto font-sans flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto font-sans">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Đăng Nhập</h2>
        <p className="text-gray-400 text-sm">Chào mừng bạn đã quay trở lại!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message - Enhanced */}
        {error && (
          <div
            className={`flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium ${
              shakeError ? 'animate-shake' : ''
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1"
          >
            Tài khoản
          </Label>
          <div className="relative group">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.email ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className={`pl-11 h-12 bg-white/5 text-white placeholder:text-gray-600 rounded-xl transition-all ${
                errors.email
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs font-medium mt-1 ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1"
          >
            Mật khẩu
          </Label>
          <div className="relative group">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-11 pr-11 h-12 bg-white/5 text-white placeholder:text-gray-600 rounded-xl transition-all ${
                errors.password
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs font-medium mt-1 ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-end">
          <Link
            href={ROUTES.AUTH.FORGOT_PASSWORD}
            className="text-blue-400 font-bold text-xs hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-0"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng nhập...
            </span>
          ) : (
            'ĐĂNG NHẬP'
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-[#1a1a2e] px-2 text-gray-600 rounded-full">OR</span>
          </div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => setShowComingSoon(true)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all bg-transparent group"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 group-hover:scale-110 transition-transform"
          />
          <span className="text-gray-300 font-semibold text-sm">Đăng nhập với Google</span>
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-medium text-gray-500">
        Bạn chưa có tài khoản?{' '}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="text-blue-400 hover:text-blue-300 font-bold hover:underline underline-offset-4 ml-1 transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName="Đăng nhập bằng Google"
      />
    </div>
  );
}
