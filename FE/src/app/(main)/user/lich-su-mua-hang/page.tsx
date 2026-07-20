import { PurchaseHistorySection } from '@/sections/user-sections/purchase-history.section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch sử mua hàng | Shop Game',
  description: 'Quản lý đơn hàng và tài khoản game đã mua.',
};

export default function PurchaseHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <PurchaseHistorySection />
    </div>
  );
}
