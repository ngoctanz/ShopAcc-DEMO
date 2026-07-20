import type { Metadata } from 'next';
import { LoginForm } from '@/components/forms/login.form';

export const metadata: Metadata = {
  title: 'Đăng Nhập',
  description:
    'Đăng nhập vào hệ thống Shop Tài Khoản Game Uy Tín để truy cập các tài khoản đã mua, theo dõi đơn hàng và quản lý thông tin cá nhân. An toàn và bảo mật tuyệt đối.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Đăng Nhập - Shop Tài Khoản Game Uy Tín',
    description: 'Truy cập vào hệ thống website mua bán acc game cao cấp.',
    type: 'website',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
