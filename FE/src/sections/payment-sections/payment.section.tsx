'use client';

import { AlertCircle, ChevronLeft, Info, Loader2, Package, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRateLimit } from '@/hooks/useRateLimit';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

// Types
export type PaymentMode = 'account' | 'clone';

export interface PaymentItem {
  id: string;
  title: string;
  code?: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  stockCount?: number;
  featuredSkins?: string[];
}

export interface PaymentSectionProps {
  mode: PaymentMode;
  item: PaymentItem;
  userBalance: number;
  isProcessing: boolean;
  onPurchase: () => void;
}

// Theme config based on mode
const themeConfig = {
  account: {
    primaryColor: 'blue',
    accentColor: 'red',
    gradientFrom: 'from-slate-900',
    gradientTo: 'to-slate-800',
    bgGradient: 'bg-slate-50/50 dark:bg-black/20',
    shadowColor: 'shadow-slate-200/50',
    badge: 'Tài khoản Game',
    successTitle: 'Thanh toán thành công!',
  },
  clone: {
    primaryColor: 'purple',
    accentColor: 'purple',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-600',
    bgGradient:
      'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20',
    shadowColor: 'shadow-purple-200/50',
    badge: 'Clone Package',
    successTitle: 'Mua Clone thành công!',
  },
};

function PaymentSection({
  mode,
  item,
  userBalance,
  isProcessing,
  onPurchase,
}: PaymentSectionProps) {
  const theme = themeConfig[mode];

  // Rate limit để chặn bấm quá nhanh
  const { checkRateLimit } = useRateLimit({
    cooldown: 3000,
    showCountdown: false,
    warningMessage: 'Bấm quá nhanh! Vui lòng đợi',
  });

  // Wrap onPurchase với rate limit check
  const handlePurchase = useCallback(() => {
    if (!checkRateLimit()) return;
    onPurchase();
  }, [checkRateLimit, onPurchase]);

  // Memoized price calculations
  const priceInfo = useMemo(() => {
    const price = item.price;
    const originalPrice = item.originalPrice || item.price;
    const hasDiscount = originalPrice > price;
    const discountPercent = hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
    const remainingBalance = userBalance - price;
    const isBalanceEnough = userBalance >= price;

    return {
      price,
      originalPrice,
      hasDiscount,
      discountPercent,
      remainingBalance,
      isBalanceEnough,
    };
  }, [item.price, item.originalPrice, userBalance]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return `${amount.toLocaleString('vi-VN')}đ`;
  }, []);

  const isClone = mode === 'clone';
  const accentColorClass = isClone ? 'purple' : 'red';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Item Info (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <Card
          className={cn(
            'overflow-hidden border-slate-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900',
            theme.shadowColor,
            'dark:shadow-none'
          )}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Badge
                variant="default"
                className={cn(
                  'font-bold px-3 py-1 uppercase tracking-wider text-[10px]',
                  isClone
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800'
                )}
              >
                {theme.badge}
              </Badge>
              <span className="font-mono text-sm font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {item.code ? `Mã: #${item.code}` : isClone ? 'CLONE' : 'ACC'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image */}
              <div
                className={cn(
                  'relative w-full sm:w-56 aspect-[16/10] rounded-xl overflow-hidden border-[3px] border-white dark:border-zinc-700 shadow-md shrink-0 group',
                  isClone
                    ? 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30'
                    : 'bg-slate-100 dark:bg-zinc-800'
                )}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Package
                      className={cn(
                        'w-12 h-12 mb-2',
                        isClone ? 'text-purple-400' : 'text-slate-400'
                      )}
                    />
                    <span
                      className={cn(
                        'font-bold text-sm',
                        isClone ? 'text-purple-500' : 'text-slate-500'
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2">
                    {item.code ? `Mã số: #${item.code}` : item.title}
                  </h2>
                  {item.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 line-clamp-3">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      {isClone ? 'Gói clone chất lượng cao.' : 'Không có mô tả chi tiết.'}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {item.featuredSkins?.slice(0, 2).map((skin, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 rounded shadow-sm"
                    >
                      {skin}
                    </span>
                  ))}
                  {isClone && item.stockCount !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded">
                      Còn {item.stockCount} acc
                    </span>
                  )}
                  {priceInfo.hasDiscount && (
                    <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-600 rounded">
                      -{priceInfo.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center group cursor-default">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-0.5">
                Giá trị thực
              </span>
              {priceInfo.hasDiscount && (
                <span className="text-sm text-slate-400 line-through decoration-slate-400/50 decoration-2">
                  {formatCurrency(priceInfo.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span
                className={cn(
                  'text-xs font-bold uppercase text-slate-400 tracking-wider block mb-0.5 transition-colors',
                  `group-hover:text-${accentColorClass}-500`
                )}
              >
                Thành tiền
              </span>
              <span
                className={cn(
                  'text-2xl font-black text-slate-900 dark:text-white transition-colors',
                  `group-hover:text-${accentColorClass}-600`
                )}
              >
                {formatCurrency(priceInfo.price)}
              </span>
            </div>
          </div>
        </Card>

        <Alert
          className={cn(
            'shadow-sm relative overflow-hidden',
            isClone
              ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-800'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800'
          )}
        >
          <div
            className={cn(
              'absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl',
              isClone ? 'bg-purple-400/10' : 'bg-blue-400/10'
            )}
          />
          <Info
            className={cn('w-4 h-4 relative z-10', isClone ? 'text-purple-600' : 'text-blue-600')}
          />
          <AlertTitle
            className={cn(
              'font-bold mb-1 relative z-10',
              isClone ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
            )}
          >
            Thông tin bàn giao
          </AlertTitle>
          <AlertDescription
            className={cn(
              'text-xs leading-relaxed relative z-10',
              isClone ? 'text-purple-600 dark:text-purple-300' : 'text-blue-600 dark:text-blue-300'
            )}
          >
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {isClone ? (
                <>
                  <li>
                    Bạn sẽ nhận <b>1 tài khoản ngẫu nhiên</b> từ kho clone.
                  </li>
                  <li>Thông tin đăng nhập hiển thị ngay sau khi thanh toán.</li>
                </>
              ) : (
                <>
                  <li>Tài khoản & Mật khẩu sẽ hiển thị ngay sau khi thanh toán.</li>
                  <li>Shop khuyến nghị đổi mật khẩu ngay sau khi nhận acc.</li>
                </>
              )}
              <li>
                Được lưu trữ vĩnh viễn trong <b>Lịch sử mua hàng</b>.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* RIGHT: Payment Action (5 cols) */}
      <PaymentActionCard
        mode={mode}
        price={priceInfo.price}
        userBalance={userBalance}
        remainingBalance={priceInfo.remainingBalance}
        isBalanceEnough={priceInfo.isBalanceEnough}
        isProcessing={isProcessing}
        onPurchase={handlePurchase}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// Separate component for payment action card
interface PaymentActionCardProps {
  mode: PaymentMode;
  price: number;
  userBalance: number;
  remainingBalance: number;
  isBalanceEnough: boolean;
  isProcessing: boolean;
  onPurchase: () => void;
  formatCurrency: (amount: number) => string;
}

function PaymentActionCard({
  mode,
  price,
  userBalance,
  remainingBalance,
  isBalanceEnough,
  isProcessing,
  onPurchase,
  formatCurrency,
}: PaymentActionCardProps) {
  const isClone = mode === 'clone';
  const theme = themeConfig[mode];

  return (
    <div className="lg:col-span-5 space-y-6">
      <Card
        className={cn(
          'overflow-hidden border-slate-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 flex flex-col h-full relative',
          theme.shadowColor,
          'dark:shadow-none'
        )}
      >
        <div className="p-6 flex-1">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Wallet className="w-5 h-5" />
            Phương thức thanh toán
          </h3>

          <div
            className={cn(
              'group relative rounded-xl border-2 p-4 transition-all duration-300 overflow-hidden',
              isClone
                ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10'
                : 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
            )}
          >
            <div
              className={cn(
                'absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-xl shadow-sm z-10',
                isClone ? 'bg-purple-600' : 'bg-blue-600'
              )}
            >
              Đang chọn
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isClone ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                )}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Số dư Shop</p>
                <p className="text-xs text-slate-500 font-medium">Xử lý tự động 24/7</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-zinc-700/60 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                  Số dư hiện tại
                </p>
                <p className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(userBalance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                  Sau thanh toán
                </p>
                <p
                  className={cn(
                    'font-mono font-bold',
                    remainingBalance < 0 ? 'text-red-500' : 'text-green-600'
                  )}
                >
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </div>

          {!isBalanceEnough && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-500">
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">
                    Số dư không đủ thanh toán
                  </p>
                  <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-snug">
                    Vui lòng nạp thêm tối thiểu{' '}
                    <span className="font-bold">{formatCurrency(Math.abs(remainingBalance))}</span>{' '}
                    để mua {isClone ? 'gói này' : 'tài khoản này'}.
                  </p>
                  <Link
                    href={ROUTES.DEPOSIT}
                    className="inline-flex items-center text-xs font-bold text-red-700 hover:text-red-800 hover:underline mt-1"
                  >
                    Nạp tiền ngay <ChevronLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action */}
        <div className="p-6 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-100 dark:border-zinc-800 backdrop-blur-sm sticky bottom-0">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-semibold text-slate-500">Tổng thanh toán:</span>
            <span
              className={cn(
                'text-3xl font-black tracking-tight',
                isClone ? 'text-purple-600' : 'text-red-600'
              )}
            >
              {formatCurrency(price)}
            </span>
          </div>
          <Button
            size="lg"
            className={cn(
              'w-full h-14 text-base font-bold uppercase tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
              isBalanceEnough
                ? isClone
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-red-500/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none dark:bg-zinc-700 dark:text-zinc-500'
            )}
            disabled={!isBalanceEnough || isProcessing}
            onClick={onPurchase}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : !isBalanceEnough ? (
              'Không đủ số dư'
            ) : (
              'Thanh toán ngay'
            )}
          </Button>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
            Khi bấm thanh toán, bạn đồng ý với{' '}
            <Link
              href="/"
              className={cn('underline', isClone ? 'hover:text-purple-500' : 'hover:text-blue-500')}
            >
              điều khoản dịch vụ
            </Link>{' '}
            của chúng tôi.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Export components
export { PaymentSection, PaymentActionCard };

// Loading component
export function PaymentLoading({ mode = 'account' }: { mode?: PaymentMode }) {
  const isClone = mode === 'clone';
  return (
    <div
      className={cn(
        'min-h-screen py-12 px-4',
        isClone
          ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20'
          : 'bg-slate-50 dark:bg-black/20'
      )}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-2xl shadow-sm" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-2xl shadow-sm" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Error component
export function PaymentError({
  message,
  mode = 'account',
}: {
  message: string;
  mode?: PaymentMode;
}) {
  const router = useRouter();
  const isClone = mode === 'clone';

  return (
    <div
      className={cn(
        'min-h-[70vh] flex flex-col items-center justify-center p-4 text-center',
        isClone
          ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20'
          : 'bg-slate-50 dark:bg-black/20'
      )}
    >
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10 rotate-3 transition-transform hover:rotate-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
        Không thể tải trang thanh toán
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-sm leading-relaxed">
        {message}
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()} className="px-6">
          Quay lại
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className={cn(
            'px-6 text-white shadow-lg',
            isClone
              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
          )}
        >
          Thử lại
        </Button>
      </div>
    </div>
  );
}

export default PaymentSection;
