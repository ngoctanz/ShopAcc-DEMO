'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmPurchaseModal from '@/components/modals/confirm-purchase.modal';
import ErrorResultModal from '@/components/modals/error-result.modal';
import LuckyResultModal from '@/components/modals/lucky-result.modal';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthContext } from '@/contexts/auth-context';
import { GloballyHandledError } from '@/lib/fetch';
import LuckyDrawSection from '@/sections/random-sections/lucky-draw.section';
import { packageService } from '@/services/account-package.service';
import type { Account, AccountPackage } from '@/types/index.type';

export default function RandomPackagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, user, refreshUser } = useAuthContext();

  const [pkg, setPackage] = useState<AccountPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultAccount, setResultAccount] = useState<Account | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await packageService.getPackageById(slug);

        if (!data || data.mode !== 'RANDOM') {
          router.push('/');
          return;
        }

        setPackage(data);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug, router]);

  const handlePurchaseClick = () => {
    if (!pkg || isAnimating) return;

    // Check authentication before showing modal
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua túi mù',
      });
      router.push(`/login?redirect=/random/${slug}`);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!pkg || isPurchasing) return;

    try {
      setIsPurchasing(true);
      setIsAnimating(true);

      // Close confirm modal
      setShowConfirmModal(false);

      // Minimum animation time for better UX
      const minAnimationTime = 3000;

      // Call API and wait for both API and animation
      const [result] = await Promise.all([
        packageService.randomPurchase(pkg._id),
        new Promise((resolve) => setTimeout(resolve, minAnimationTime)),
      ]);

      // Refresh user balance
      await refreshUser();

      // Set result account from API response
      setResultAccount(result.account);

      // Update package count
      setPackage((prev) =>
        prev ? { ...prev, accountCount: Math.max(0, (prev.accountCount || 1) - 1) } : null
      );

      // Show result modal after animation
      setTimeout(() => {
        setShowResultModal(true);
      }, 500);

      toast.success('🎉 Mua ngẫu nhiên thành công!', {
        description: 'Thông tin tài khoản đã được gửi về lịch sử mua hàng',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Random purchase error:', error);

      // Reset animation state on error
      setIsAnimating(false);

      // Don't show local error modal if already handled by global error handler
      if (error instanceof GloballyHandledError) {
        return;
      }

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        setShowErrorModal(true);
        return;
      }

      // Show error modal
      setErrorMessage(
        error.response?.data?.message || error.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau'
      );
      setShowErrorModal(true);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
        <div className="text-center">
          <div className="text-8xl mb-4">😢</div>
          <h2 className="text-3xl font-bold mb-2">Không tìm thấy</h2>
          <p className="text-muted-foreground mb-6">Gói túi mù này không tồn tại</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (pkg.accountCount === 0 && !resultAccount && !isAnimating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <EmptyState mode="out-of-stock" />
      </div>
    );
  }

  return (
    <>
      <LuckyDrawSection
        pkg={pkg}
        onPurchase={handlePurchaseClick}
        resultAccount={resultAccount}
        isAnimating={isAnimating}
        onOpenModal={() => setShowResultModal(true)}
        onBack={() => router.push('/')}
      />

      <ConfirmPurchaseModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        pkg={pkg}
        userBalance={user?.balance || 0}
        isProcessing={isPurchasing}
      />

      <LuckyResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setIsAnimating(false);
          setResultAccount(null);
        }}
        account={resultAccount}
        package={pkg}
      />

      <ErrorResultModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </>
  );
}
