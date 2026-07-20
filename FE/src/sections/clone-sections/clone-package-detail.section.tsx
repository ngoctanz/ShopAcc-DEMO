'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Info,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ErrorResultModal from '@/components/modals/error-result.modal';
import { useAuthContext } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import type { AccountPackage } from '@/types/index.type';

interface ClonePackageDetailSectionProps {
  pkg: AccountPackage;
}


function ClonePackageDetailSection({ pkg }: ClonePackageDetailSectionProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [imageError, setImageError] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Memoized price calculations - prevent recalculation on every render
  const priceInfo = useMemo(() => {
    const originalPrice = pkg.price || 0;
    const finalPrice = pkg.discountPrice || pkg.price || 0;
    const hasDiscount = !!(pkg.discountPrice && pkg.price && pkg.discountPrice < pkg.price);
    const discountPercent = hasDiscount
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

    return { originalPrice, finalPrice, hasDiscount, discountPercent };
  }, [pkg.price, pkg.discountPrice]);

  // Memoized stock info
  const stockInfo = useMemo(() => {
    const count = pkg.accountCount || 0;
    return { stockCount: count, isInStock: count > 0 };
  }, [pkg.accountCount]);

  // Memoized package ID tag (last 6 chars)
  const packageIdTag = useMemo(() => {
    if (!pkg._id || typeof pkg._id !== 'string') return 'N/A';
    return pkg._id.slice(-6).toUpperCase();
  }, [pkg._id]);

  // Memoized user balance check
  const balanceInfo = useMemo(() => {
    const userBalance = user?.balance || 0;
    const canAfford = userBalance >= priceInfo.finalPrice;
    return { userBalance, canAfford };
  }, [user?.balance, priceInfo.finalPrice]);

  // Format currency - memoized formatter
  const formatCurrency = useCallback((amount: number) => {
    return `${amount.toLocaleString('vi-VN')}đ`;
  }, []);


  const handleBuyNow = useCallback(() => {
    // Check stock before redirecting
    if (!stockInfo.isInStock) {
      setErrorMessage('Gói này đã hết hàng. Vui lòng quay lại sau hoặc chọn gói khác.');
      setShowErrorModal(true);
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua gói clone',
      });
      // Encode redirect URL to prevent injection
      const redirectUrl = encodeURIComponent(`/clone/${pkg.slug || pkg._id}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    // Redirect to clone payment page - use _id for security
    router.push(`/payment/clone/${pkg._id}`);
  }, [isAuthenticated, router, pkg.slug, pkg._id, stockInfo.isInStock]);

  /**
   * Handle image load error
   */
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-colors duration-300">
      {/* Left Column - Package Image & Description (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-card rounded-xl overflow-hidden border border-border/50 p-3 shadow-lg transition-all h-full bg-zinc-50 dark:bg-zinc-900/50">
          {/* Main Image Viewer */}
          <div className="relative aspect-video rounded-lg overflow-hidden group bg-black/5">
            {pkg.image && !imageError ? (
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-full h-full object-contain md:object-cover transition-all duration-500"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                <Package className="w-24 h-24 text-purple-400 mb-4" />
                <p className="text-purple-600 dark:text-purple-400 font-bold text-xl">
                  {pkg.title}
                </p>
              </div>
            )}

            {/* Clone Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                CLONE
              </div>
            </div>

            {/* Discount Badge */}
            {priceInfo.hasDiscount && (
              <div className="absolute top-4 left-4">
                <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded shadow-lg">
                  -{priceInfo.discountPercent}%
                </div>
              </div>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/10">
              <ImageIcon className="w-3.5 h-3.5" />1 / 1
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-6 px-2">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Mô Tả Gói</h3>
                <p className="text-xs text-muted-foreground">Thông tin chi tiết về gói clone</p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-lg p-4">
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-wrap">
                {pkg.description ||
                  'Gói clone chất lượng cao. Mua để nhận ngay 1 tài khoản từ kho.'}
              </p>
            </div>

            {/* Fixed Clone Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>100% trắng thông tin, chưa liên kết bất kỳ dịch vụ nào</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Phù hợp để làm sự kiện hoặc làm acc phụ</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Mua xong sẽ nhận được 1 tài khoản ngẫu nhiên từ kho</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Giao dịch tự động, nhận acc ngay sau khi thanh toán</span>
              </div>
            </div>

            {/* Bulk Order Notice */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                    Mua số lượng lớn?
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    Tính năng hỗ trợ mua số lượng lớn được lược bỏ trong phiên bản demo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Purchase Card (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl sticky top-24">
          {/* Header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Clone
              </span>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                #{packageIdTag}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {pkg.title}
            </h1>
          </div>

          {/* Stock Info */}
          <div
            className={cn(
              'border rounded-lg p-4 mb-6',
              stockInfo.isInStock
                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-sm font-medium',
                  stockInfo.isInStock
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                {stockInfo.isInStock ? 'Còn trong kho' : 'Tạm hết hàng'}
              </span>
              <div className="flex items-center gap-2">
                {stockInfo.isInStock && (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
                <span
                  className={cn(
                    'text-lg font-black',
                    stockInfo.isInStock
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  )}
                >
                  {stockInfo.stockCount}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Giá bán hiện tại
            </p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-500">
                {formatCurrency(priceInfo.finalPrice)}
              </span>
              {priceInfo.hasDiscount && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-zinc-400 line-through font-medium">
                    {formatCurrency(priceInfo.originalPrice)}
                  </span>
                </div>
              )}
            </div>
            {priceInfo.hasDiscount && (
              <div className="mt-2 inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[11px] font-bold text-red-600 dark:text-red-400">
                <span>TIẾT KIỆM {priceInfo.discountPercent}%</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {stockInfo.isInStock ? (
              <>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base uppercase tracking-wide cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Mua Ngay
                </button>

                {/* User Balance - Only show when authenticated */}
                {isAuthenticated && (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      Số dư:{' '}
                      <span
                        className={cn(
                          'font-bold',
                          balanceInfo.canAfford ? 'text-green-600' : 'text-red-500'
                        )}
                      >
                        {formatCurrency(balanceInfo.userBalance)}
                      </span>
                    </span>
                  </div>
                )}

                <button className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 text-zinc-700 dark:text-zinc-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm group">
                  <ShieldCheck className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                  Hướng dẫn mua hàng an toàn
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800"
              >
                <Package className="w-5 h-5" />
                TẠM HẾT HÀNG
              </button>
            )}
          </div>

          {/* Guarantee */}
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Uy tín 100%</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Bảo hành trọn đời</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <Clock className="w-4 h-4 text-green-500" />
              <span>Giao tự động 5s</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <Info className="w-4 h-4 text-green-500" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorResultModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}

export default ClonePackageDetailSection;
