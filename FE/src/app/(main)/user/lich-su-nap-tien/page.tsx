import type { Metadata } from 'next';
import { DemoNotice } from '@/components/demo-notice';

export const metadata: Metadata = {
  title: 'Lịch sử nạp tiền | Shop Game',
  description: 'Xem lại lịch sử nạp thẻ và chuyển khoản của bạn.',
};

export default function TopupHistoryPage() {
  return <DemoNotice feature="Lịch sử nạp tiền" />;
}
