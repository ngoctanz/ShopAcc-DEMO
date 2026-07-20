'use client';

import { CheckCircle2, ChevronLeft, Info, Loader2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ErrorResultModal from '@/components/modals/error-result.modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/contexts/auth-context';
import { GloballyHandledError } from '@/lib/fetch';
import PaymentSection, {
  PaymentError,
  type PaymentItem,
  PaymentLoading,
} from '@/sections/payment-sections/payment.section';
import { accountService } from '@/services/account.service';
import { authService } from '@/services/auth.service';
import type { Account, User } from '@/types/index.type';
import { getFirstErrorMessage, validatePayment } from '@/utils/payment.util';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshUser } = useAuthContext();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Result modal states
  const [showResultModal, setShowResultModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID tài khoản không hợp lệ.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [accountData, userData] = await Promise.all([
          accountService.getAccountById(id).catch(() => null),
          authService.getCurrentUser().catch(() => null),
        ]);

        if (!accountData) {
          setError('Không tìm thấy thông tin tài khoản.');
          return;
        }

        if (accountData.status !== 'AVAILABLE') {
          setError('Tài khoản này đã được bán hoặc không còn khả dụng. Vui lòng chọn tài khoản khác.');
          setAccount(accountData);
          return;
        }

        setAccount(accountData);

        if (!userData) {
          setError('Vui lòng đăng nhập để thực hiện thanh toán.');
          return;
        }
        setUser(userData);
      } catch (err: any) {
        console.error('Error loading payment data:', err);
        setError('Có lỗi xảy ra khi tải thông tin. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle purchase
  const handlePurchase = useCallback(async () => {
    if (!account || !user) return;

    const validation = validatePayment(account, user, 'BALANCE');
    if (!validation.canPurchase) {
      toast.error('Không thể thanh toán', {
        description: getFirstErrorMessage(validation) || 'Vui lòng kiểm tra lại thông tin.',
      });
      setShowConfirmDialog(false);
      return;
    }

    try {
      setIsProcessing(true);
      await accountService.purchaseAccount(account._id);
      await refreshUser();

      setShowConfirmDialog(false);
      setShowResultModal(true);

      if (validation.warnings.length > 0) {
        validation.warnings.forEach((w) => toast.info(w.message, { duration: 4000 }));
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      setShowConfirmDialog(false);
      
      // Don't show local error modal if already handled by global error handler
      if (err instanceof GloballyHandledError) {
        return;
      }
      
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Vui lòng kiểm tra lại số dư hoặc thử lại sau.'
      );
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  }, [account, user, refreshUser]);

  // Transform account to PaymentItem
  const accountImage = account?.coverImage || account?.images?.[0];
  const paymentItem: PaymentItem | null = account
    ? {
        id: account._id,
        title: account.package?.title || 'Tài khoản Game',
        code: account.code,
        description: account.accountInfo,
        image: accountImage,
        price: account.price,
        originalPrice: account.originalPrice,
        featuredSkins: account.featuredSkins,
      }
    : null;

  if (isLoading) return <PaymentLoading mode="account" />;
  if (error || !account || !paymentItem)
    return <PaymentError message={error || 'Tài khoản không tồn tại'} mode="account" />;

  const price = account.price;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black/20 pb-20 pt-8 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 pl-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group mb-4 -ml-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Quay lại chi tiết
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Xác nhận thanh toán
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Vui lòng kiểm tra kỹ thông tin trước khi "Chốt đơn".
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Giao dịch an toàn
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Bảo hành trọn đời
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <PaymentSection
          mode="account"
          item={paymentItem}
          userBalance={user?.balance || 0}
          isProcessing={isProcessing}
          onPurchase={() => setShowConfirmDialog(true)}
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0 gap-0">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-center text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Xác nhận giao dịch</DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-1">
              Giao dịch sẽ được xử lý tự động ngay lập tức
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
              <div className="w-12 h-12 relative rounded-md overflow-hidden bg-slate-200 shrink-0">
                {accountImage && <Image src={accountImage} alt="" fill className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">
                  #{account.code || 'N/A'} - {account.package?.title || 'Tài khoản'}
                </p>
                <p className="text-xs text-red-500 font-bold mt-0.5">
                  {price.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Phương thức:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">Số dư Shop</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Phí giao dịch:</span>
                <span className="font-bold text-green-600">Miễn phí</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tổng cộng:
                </span>
                <span className="text-xl font-black text-red-600">
                  {price.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-700 gap-3 grid grid-cols-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
              className="w-full text-slate-600"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Xác nhận mua'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={showResultModal}
        onOpenChange={(open) => {
          // Khi đóng modal (bấm X, click outside, ESC), redirect về trang chủ
          if (!open) {
            router.push('/');
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0 gap-0">
          <div className="p-8 text-center bg-gradient-to-br from-green-500 to-emerald-600">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30 bg-white/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-white mb-2">
              Thanh toán thành công!
            </DialogTitle>
            <DialogDescription className="text-white/90 text-sm">
              Thông tin tài khoản đã được gửi tới lịch sử đơn hàng.
            </DialogDescription>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <Info className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Thông tin tài khoản đã được lưu trong lịch sử mua hàng của bạn.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Về trang chủ
                </Button>
                <Button
                  onClick={() => router.push('/user/lich-su-mua-hang')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  Xem đơn hàng
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <ErrorResultModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
