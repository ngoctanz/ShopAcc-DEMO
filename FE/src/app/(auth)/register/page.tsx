import type { Metadata } from 'next';
import { RegisterForm } from '@/components/forms/register.form';

export const metadata: Metadata = {
  title: 'Đăng Ký Tài Khoản',
  description:
    'Tạo tài khoản mới tại Shop Tài Khoản Game Uy Tín. Gia nhập cộng đồng hàng ngàn game thủ để sở hữu các tài khoản game cao cấp với giao dịch an toàn và nhận thông tin ngay lập tức.',
  keywords: [
    'đăng ký tài khoản game',
    'tạo tài khoản shop game',
    'đăng ký mua acc',
    'gia nhập cộng đồng game thủ',
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Đăng Ký Thành Viên - Shop Tài Khoản Game Uy Tín',
    description: 'Trở thành thành viên của hệ thống mua bán tài khoản game tin cậy nhất.',
    type: 'website',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
