'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import ComingSoonModal from '@/components/modals/coming-soon.modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { authService } from '@/services/auth.service';

// Định nghĩa schema validation
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Vui lòng nhập họ tên')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên quá dài'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Định dạng email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(32, 'Mật khẩu không được vượt quá 32 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Map các lỗi từ backend sang tiếng Việt
const ERROR_MESSAGES: Record<string, string> = {
  'Email already exists': 'Email này đã được sử dụng',
  'Email already registered': 'Email này đã được đăng ký',
  'Invalid email format': 'Định dạng email không hợp lệ',
  'Password too weak': 'Mật khẩu quá yếu. Hãy thêm chữ số hoặc ký tự đặc biệt.',
  'Network error': 'Lỗi kết nối mạng. Vui lòng thử lại.',
  'Too many requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
};

function translateError(error: string): string {
  return ERROR_MESSAGES[error] || error || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  const { isLoading: isCheckingAuth } = useRedirectIfAuthenticated();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch các trường để clear error khi user nhập
  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // Clear error khi user thay đổi input
  useEffect(() => {
    if (error) {
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, emailValue, passwordValue, confirmPasswordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setShakeError(false);

      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Hiển thị success message
      setSuccess(true);

      // Redirect sau 2 giây
      setTimeout(() => {
        router.push(ROUTES.AUTH.LOGIN);
      }, 2000);
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

  // Success state
  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto font-sans text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-400 text-sm">
            Chào mừng bạn đến với cộng đồng game thủ. Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto font-sans">
      <div className="text-left mb-6">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Đăng Ký</h2>
        <p className="text-gray-400 text-sm">Khởi tạo hành trình mới cùng chúng tôi</p>
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

        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1"
          >
            Họ và tên
          </Label>
          <div className="relative group">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.name ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              className={`pl-11 h-12 bg-white/5 text-white placeholder:text-gray-600 rounded-xl transition-all ${
                errors.name
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-red-400 text-xs font-medium mt-1 ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1"
          >
            Địa chỉ Email
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
              placeholder="yourname@example.com"
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
              placeholder="Tối thiểu 8 ký tự"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1"
          >
            Xác nhận mật khẩu
          </Label>
          <div className="relative group">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.confirmPassword
                  ? 'text-red-400'
                  : 'text-gray-500 group-focus-within:text-blue-400'
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              className={`pl-11 pr-11 h-12 bg-white/5 text-white placeholder:text-gray-600 rounded-xl transition-all ${
                errors.confirmPassword
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs font-medium mt-1 ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-0 mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng ký...
            </span>
          ) : (
            'ĐĂNG KÝ TÀI KHOẢN'
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
          <span className="text-gray-300 font-semibold text-sm">Đăng ký với Google</span>
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-medium text-gray-500">
        Đã có tài khoản trước đó?{' '}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-blue-400 hover:text-blue-300 font-bold hover:underline underline-offset-4 ml-1 transition-colors"
        >
          Đăng Nhập Ngay
        </Link>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName="Đăng ký bằng Google"
      />
    </div>
  );
}
