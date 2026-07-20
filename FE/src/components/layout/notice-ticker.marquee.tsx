'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { orderService } from '@/services/order.service';
import { formatTimeAgo } from '@/utils/format';

interface RecentPurchase {
  userName: string;
  description: string;
  price: number;
  createdAt: string;
}

function NoticeTicker() {
  const [purchases, setPurchases] = useState<RecentPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPurchases = async () => {
      try {
        const data = await orderService.getRecentPurchases(20);
        setPurchases(data);
      } catch (error) {
        console.error('Failed to fetch recent purchases:', error);
        // Fallback to dummy data if API fails
        setPurchases([
          {
            userName: 'Us***er',
            description: 'Tài khoản VIP',
            price: 150000,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPurchases();
  }, []); // Empty deps - only fetch once on mount

  // Memoize repeated purchases to avoid recalculation
  const repeatedPurchases = useMemo(() => {
    return purchases.length > 0 ? [...purchases, ...purchases, ...purchases, ...purchases] : [];
  }, [purchases]);

  return (
    <div className="w-full mt-6">
      {/* Top Scrolling Ticker */}
      <div className="bg-card border border-border rounded-xl shadow-sm mb-3 overflow-hidden h-12 flex items-center transition-colors duration-300">
        <div className="flex items-center whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-primary font-bold text-base mr-2">🔔</span>
              <span className="text-foreground font-semibold text-sm sm:text-base uppercase tracking-tight">
                DEMO BY NGOCTANZ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling Ticker - Recent Purchases */}
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden h-14 flex items-center transition-colors duration-300">
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <span className="text-muted-foreground text-sm">Đang tải...</span>
          </div>
        ) : repeatedPurchases.length > 0 ? (
          <div className="flex items-center whitespace-nowrap animate-marquee gap-8">
            {repeatedPurchases.map((purchase, index) => (
              <PurchaseItem key={index} purchase={purchase} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <span className="text-muted-foreground text-sm">Chưa có giao dịch gần đây</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoized purchase item component
const PurchaseItem = memo(({ purchase }: { purchase: RecentPurchase }) => {
  return (
    <div className="inline-flex items-center gap-2 text-sm sm:text-base shrink-0">
      <span className="text-green-500">🎉</span>
      <span className="text-pink-600 dark:text-pink-400 font-bold">{purchase.userName}</span>
      <span className="text-muted-foreground">đã mua</span>
      <span className="text-blue-500 dark:text-blue-400 font-bold uppercase text-sm tracking-tighter">
        {purchase.description}
      </span>
      <span className="text-muted-foreground">với giá</span>
      <span className="text-primary font-extrabold">{purchase.price.toLocaleString('vi-VN')}đ</span>
      <span className="text-orange-500 dark:text-orange-400 text-sm font-medium italic">
        {formatTimeAgo(purchase.createdAt)}
      </span>
    </div>
  );
});

PurchaseItem.displayName = 'PurchaseItem';

export default memo(NoticeTicker);
