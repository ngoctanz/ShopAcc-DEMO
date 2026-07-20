import type { Metadata } from 'next';
import { DemoNotice } from '@/components/demo-notice';

export const metadata: Metadata = {
  title: 'Nạp Tiền Tài Khoản',
  description:
    'Nạp tiền vào tài khoản để mua tài khoản game. Hỗ trợ thẻ cào điện thoại và chuyển khoản ngân hàng.',
};

export default function TopupPage() {
  return <DemoNotice feature="Nạp tiền" />;
}
