import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/forms/forgot-password.form';

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu',
  description: 'Khôi phục mật khẩu tài khoản Shop Game.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
