import type { Metadata } from 'next';
import { WishlistSection } from '@/sections/user-sections/wishlist.section';

export const metadata: Metadata = {
  title: 'Danh sách yêu thích | Shop Game',
  description: 'Xem lại các tài khoản game bạn đã lưu.',
};

export default function WishlistPage() {
  return (
    <div className="container mx-auto py-8">
      <WishlistSection />
    </div>
  );
}
