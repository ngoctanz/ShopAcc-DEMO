'use client';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Image as ImageIcon,
  Info,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ErrorResultModal from '@/components/modals/error-result.modal';
import { useAuthContext } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { GameRoutes } from '@/routes';
import { wishlistService } from '@/services/wishlist.service';
import type { Account } from '@/types/index.type';
import { getAccountImages } from '@/utils/image.util';
import { getAccountPriceInfo } from '@/utils/price.util';

interface AccountDetailSectionProps {
  account: Account;
  gameName: string;
}

function AccountDetailSection({ account, gameName }: AccountDetailSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && account._id) {
      wishlistService
        .isInWishlist(account._id)
        .then(setIsWishlisted)
        .catch(() => {});
    }
  }, [isAuthenticated, account._id]);

  // Memoized price calculations
  const priceInfo = useMemo(() => {
    return getAccountPriceInfo(account);
  }, [account]);

  const { currentPrice, originalPrice, hasDiscount, discountPercent } = priceInfo;

  // Images array (cover + gallery) - memoized
  const allImages = useMemo(() => {
    const images = getAccountImages(account);
    return images.length > 0 ? images : ['/placeholder-account.png'];
  }, [account]);

  // Memoized account code tag
  const accountCodeTag = useMemo(() => {
    return account.code || account._id?.slice(-6).toUpperCase() || 'N/A';
  }, [account.code, account._id]);

  // Safe selected image index
  const safeSelectedImage = useMemo(() => {
    return Math.min(selectedImage, allImages.length - 1);
  }, [selectedImage, allImages.length]);

  /**
   * Toggle wishlist - Add/Remove account from user's wishlist
   * Requires authentication
   */
  const handleToggleWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để thêm vào yêu thích',
      });
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : `/`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (isTogglingWishlist || !account._id) return;

    try {
      setIsTogglingWishlist(true);

      if (isWishlisted) {
        await wishlistService.removeFromWishlist(account._id);
        setIsWishlisted(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistService.addToWishlist(account._id);
        setIsWishlisted(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (error: any) {
      toast.error('Thao tác thất bại', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [isAuthenticated, isWishlisted, isTogglingWishlist, account._id, router]);

  /**
   * Navigate to payment page
   * Check account status before redirecting
   * Clone accounts go to /payment/clone/[id], others go to /payment/[id]
   */
  const handleBuyNow = useCallback(() => {
    if (!account._id) return;
    
    // Check if account is still available
    if (account.status !== 'AVAILABLE') {
      setErrorMessage('Tài khoản này đã được bán hoặc không còn khả dụng.');
      setShowErrorModal(true);
      return;
    }
    
    // Clone accounts go to clone payment page
    if (account.isClone) {
      router.push(`/payment/clone/${account._id}`);
    } else {
      router.push(GameRoutes.accountPayment(account._id));
    }
  }, [router, account._id, account.status, account.isClone]);

  /**
   * Handle image load error
   */
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  /**
   * Navigate to next image in gallery
   */
  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  /**
   * Navigate to previous image in gallery
   */
  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-colors duration-300">
      {/* Left Column - Images Gallery (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-card rounded-xl overflow-hidden border border-border/50 p-3 shadow-lg transition-all h-full bg-zinc-50 dark:bg-zinc-900/50">
          {/* Main Image Viewer */}
          <div className="relative aspect-video rounded-lg overflow-hidden group bg-black/5">
            {!imageError ? (
              <img
                src={allImages[safeSelectedImage]}
                alt={`Account ${accountCodeTag} preview`}
                className="w-full h-full object-contain md:object-cover transition-all duration-500"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                <ImageIcon className="w-16 h-16 text-zinc-400 mb-2" />
                <p className="text-zinc-500 text-sm">Không thể tải ảnh</p>
              </div>
            )}

            {/* Status Overlays */}
            {account.status === 'SOLD' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-red-600 text-white px-8 py-4 rounded-xl text-2xl font-black uppercase tracking-widest shadow-2xl border-2 border-white/20 transform -rotate-12">
                  ĐÃ BÁN
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/10">
              <ImageIcon className="w-3.5 h-3.5" />
              {safeSelectedImage + 1} / {allImages.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-[3px] transition-all duration-200',
                    selectedImage === idx
                      ? 'border-blue-600 shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                  )}
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Featured Skins Section */}
          <div className="mt-6 px-2">
            <div className="flex items-center gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Điểm Nổi Bật</h3>
                <p className="text-xs text-muted-foreground">Các skin và vật phẩm giá trị</p>
              </div>
            </div>

            {account.featuredSkins && account.featuredSkins.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {account.featuredSkins.map((skin, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm"
                  >
                    <span className="text-sm font-medium text-foreground">{skin}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic pl-1">
                Đang cập nhật danh sách nổi bật...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Info & Action (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl sticky top-24">
          {/* Header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {gameName || 'Game'}
              </span>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                #{accountCodeTag}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Mã số: #{accountCodeTag}
            </h1>
          </div>
          {/* Account Status Info Box - IMPORTANT */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                  Thông tin tài khoản
                </h4>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                  {account.accountInfo || 'Đang cập nhật thông tin...'}
                </p>
              </div>
            </div>
          </div>
          {/* Pricing */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Giá bán hiện tại
            </p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-red-600 dark:text-red-500">
                {currentPrice.toLocaleString('vi-VN')}đ
              </span>
              {hasDiscount && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-zinc-400 line-through font-medium">
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>
            {hasDiscount && (
              <div className="mt-2 inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[11px] font-bold text-red-600 dark:text-red-400">
                <span>TIẾT KIỆM {discountPercent}%</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {account.status === 'AVAILABLE' ? (
              <>
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base uppercase tracking-wide cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Mua Ngay
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    className={cn(
                      'w-14 flex items-center justify-center rounded-xl border-2 transition-all disabled:opacity-50',
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-900'
                        : 'bg-transparent border-input hover:bg-accent text-muted-foreground hover:text-red-500 hover:border-red-200'
                    )}
                    title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    {isTogglingWishlist ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart
                        className={cn(
                          'w-6 h-6 transition-all',
                          isWishlisted && 'fill-current scale-110'
                        )}
                      />
                    )}
                  </button>
                </div>
                <Link href="/">
                  <button className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 text-zinc-700 dark:text-zinc-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm group">
                    <ShieldCheck className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                    Hướng dẫn mua hàng an toàn
                  </button>
                </Link>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800"
              >
                <ShieldAlert className="w-5 h-5" />
                TÀI KHOẢN ĐÃ BÁN
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

export default AccountDetailSection;
