'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Lock, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Vui lòng nhập email'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 ký tự'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type Step = 'EMAIL' | 'OTP' | 'PASSWORD';

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Forms
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });
  const passwordForm = useForm<z.infer<typeof resetPasswordSchema>>({ resolver: zodResolver(resetPasswordSchema) });

  const handleSendEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setError('');
    try {
      if(!authService.forgotPassword) throw new Error("Service not implemented");
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.verifyOtp(email, data.otp);
      setOtp(data.otp);
      setStep('PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.resetPassword({ 
        email, 
        otp, 
        newPassword: data.password 
      });
      // Success - redirect to login
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto font-sans">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Quên mật khẩu</h2>
        <p className="text-gray-400 text-sm">
          {step === 'EMAIL' && "Nhập email để nhận mã xác thực"}
          {step === 'OTP' && `Nhập mã OTP đã gửi tới ${email}`}
          {step === 'PASSWORD' && "Đặt lại mật khẩu mới"}
        </p>
      </div>

      <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
            </div>
        )}

        {step === 'EMAIL' && (
            <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input 
                            {...emailForm.register('email')}
                            placeholder="email@example.com" 
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white rounded-xl"
                        />
                    </div>
                    {emailForm.formState.errors.email && (
                        <p className="text-red-400 text-xs ml-1">{emailForm.formState.errors.email.message}</p>
                    )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Gửi mã OTP"}
                </Button>
            </form>
        )}

        {step === 'OTP' && (
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Mã OTP</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input 
                            {...otpForm.register('otp')}
                            placeholder="123456" 
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white rounded-xl text-center tracking-[0.5em] font-bold text-lg"
                            maxLength={6}
                        />
                    </div>
                     {otpForm.formState.errors.otp && (
                        <p className="text-red-400 text-xs ml-1">{otpForm.formState.errors.otp.message}</p>
                    )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Xác thực"}
                </Button>
                <div className="text-center mt-2">
                    <button type="button" onClick={() => setStep('EMAIL')} className="text-sm text-gray-400 hover:text-white transition-colors">Gửi lại mã?</button>
                </div>
            </form>
        )}

        {step === 'PASSWORD' && (
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Mật khẩu mới</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input 
                            {...passwordForm.register('password')}
                            type="password"
                            placeholder="••••••••" 
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white rounded-xl"
                        />
                    </div>
                     {passwordForm.formState.errors.password && (
                        <p className="text-red-400 text-xs ml-1">{passwordForm.formState.errors.password.message}</p>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Nhập lại mật khẩu</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input 
                            {...passwordForm.register('confirmPassword')}
                            type="password"
                            placeholder="••••••••" 
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white rounded-xl"
                        />
                    </div>
                     {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-400 text-xs ml-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Đổi mật khẩu"}
                </Button>
            </form>
        )}
      </div>

       <div className="mt-8 text-center text-xs font-medium text-gray-500">
        Quay lại{' '}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 font-bold hover:underline underline-offset-4 ml-1 transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
