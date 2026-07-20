'use client';

import { CheckCircle2, ChevronLeft, Info, Loader2, Package, ShieldCheck } from 'lucide-react';
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
import { QuantitySelector } from '@/components/ui/quantity-selector';
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
import { formatCurrency as formatCurrencyUtil } from '@/utils/format';

export default function ClonePaymentPage() {
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

  // Quantity state for bulk purchase
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 10;

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

        if (!accountData.isClone) {
          setError('Tài khoản này không phải tài khoản Clone.');
          return;
        }

        if (accountData.status !== 'AVAILABLE') {
          setError('Tài khoản này hiện không khả dụng.');
          return;
        }

        if ((accountData.quantity || 0) === 0) {
          setError('Tài khoản này đã hết hàng. Vui lòng quay lại sau hoặc chọn tài khoản khác.');
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

  // Price calculations with quantity
  const unitPrice = account?.price || 0;
  const totalPrice = unitPrice * quantity;
  const stockCount = account?.quantity || 0;

  // Format currency helper
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount);

  // Handle purchase - use account-based API
  const handlePurchase = useCallback(async () => {
    if (!account || !user) return;

    // Check if user has enough balance for total
    if ((user.balance || 0) < totalPrice) {
      setErrorMessage(`Số dư không đủ. Cần ${formatCurrency(totalPrice)} để mua ${quantity} tài khoản.`);
      setShowConfirmDialog(false);
      setShowErrorModal(true);
      return;
    }

    // Check stock
    if (quantity > stockCount) {
      setErrorMessage(`Không đủ hàng. Chỉ còn ${stockCount} tài khoản trong kho.`);
      setShowConfirmDialog(false);
      setShowErrorModal(true);
      return;
    }

    try {
      setIsProcessing(true);
      await accountService.purchaseCloneAccount(account._id, quantity);
      await refreshUser();

      setShowConfirmDialog(false);
      setShowResultModal(true);
    } catch (err: any) {
      console.error('Clone purchase error:', err);
      setShowConfirmDialog(false);
      
      // Don't show local error modal if already handled by global error handler
      if (err instanceof GloballyHandledError) {
        return;
      }
      
      // Extract error message from API response
      const apiMessage = err.response?.data?.message || err.message;
      
      // Map common BE errors to user-friendly messages
      let friendlyMessage = 'Vui lòng kiểm tra lại số dư hoặc thử lại sau.';
      if (apiMessage) {
        if (apiMessage.includes('Insufficient balance')) {
          friendlyMessage = 'Số dư không đủ để thực hiện giao dịch này.';
        } else if (apiMessage.includes('Not enough')) {
          friendlyMessage = 'Không đủ tài khoản trong kho. Vui lòng giảm số lượng hoặc thử lại sau.';
        } else if (apiMessage.includes('not available')) {
          friendlyMessage = 'Tài khoản này hiện không khả dụng.';
        } else if (apiMessage.includes('not active')) {
          friendlyMessage = 'Tài khoản của bạn đang bị khóa.';
        } else if (apiMessage.includes('Quantity must be')) {
          friendlyMessage = 'Số lượng không hợp lệ. Vui lòng chọn từ 1-10 tài khoản.';
        } else {
          friendlyMessage = apiMessage;
        }
      }
      
      setErrorMessage(friendlyMessage);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  }, [account, user, quantity, totalPrice, stockCount, refreshUser]);

  // Transform account to PaymentItem
  const accountIdTag = account?._id?.slice(-6).toUpperCase() || 'N/A';
  const packageTitle = (account?.packageId as any)?.title || account?.accountInfo || 'Clone Account';
  const paymentItem: PaymentItem | null = account
    ? {
        id: account._id,
        title: packageTitle,
        code: account.code || accountIdTag,
        description: account.accountInfo,
        image: account.coverImage || (account?.packageId as any)?.image,
        price: totalPrice, // (unitPrice * quantity)
        originalPrice: (account.originalPrice || account.price || 0) * quantity,
        stockCount: account.quantity,
      }
    : null;

  if (isLoading) return <PaymentLoading mode="clone" />;
  if (error || !account || !paymentItem)
    return <PaymentError message={error || 'Tài khoản clone không tồn tại'} mode="clone" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 pb-20 pt-8 font-sans transition-colors duration-300">
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
                Thanh toán Clone Package
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Vui lòng kiểm tra kỹ thông tin trước khi "Chốt đơn".
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quantity Selector Card - Show before payment details */}
          <div className="lg:col-span-12">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col gap-4">
                {/* Header + Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      Số lượng mua
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      Tối đa {Math.min(MAX_QUANTITY, stockCount)} tài khoản/lần
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={MAX_QUANTITY}
                      maxStock={stockCount}
                    />

                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">
                        Thành tiền
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-purple-600">
                        {formatCurrency(totalPrice)}
                      </p>
                      {quantity > 1 && (
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                          {formatCurrency(unitPrice)} × {quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bulk purchase note */}
                <div className="pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                      Hỗ trợ mua số lượng lớn được lược bỏ trong phiên bản demo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-6" />

        <PaymentSection
          mode="clone"
          item={paymentItem}
          userBalance={user?.balance || 0}
          isProcessing={isProcessing}
          onPurchase={() => setShowConfirmDialog(true)}
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0 gap-0">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Xác nhận giao dịch</DialogTitle>
            <DialogDescription className="text-purple-100 text-xs mt-1">
              Giao dịch sẽ được xử lý tự động ngay lập tức
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
              <div className="w-12 h-12 relative rounded-md overflow-hidden bg-purple-100 shrink-0 flex items-center justify-center">
                {paymentItem.image ? (
                  <Image src={paymentItem.image} alt="" fill className="object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-purple-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">
                  {paymentItem.title || 'Clone Account'}
                </p>
                <p className="text-xs text-purple-500 font-bold mt-0.5">
                  {formatCurrency(unitPrice)} × {quantity} = {formatCurrency(totalPrice)}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-bold text-sm">
                  {quantity}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Số lượng:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{quantity} tài khoản</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Đơn giá:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(unitPrice)}</span>
              </div>
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
                <span className="text-xl font-black text-purple-600">{formatCurrency(totalPrice)}</span>
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
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
          <div className="p-8 text-center bg-gradient-to-br from-purple-500 to-indigo-600">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30 bg-white/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-white mb-2">
              Mua Clone thành công!
            </DialogTitle>
            <DialogDescription className="text-white/90 text-sm">
              {quantity > 1
                ? `Đã mua ${quantity} tài khoản thành công.`
                : 'Thông tin tài khoản đã được gửi tới lịch sử đơn hàng.'}
            </DialogDescription>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <Info className="w-5 h-5 text-purple-600 shrink-0" />
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {quantity > 1
                    ? `${quantity} tài khoản đã được lưu trong lịch sử mua hàng của bạn.`
                    : 'Thông tin tài khoản đã được lưu trong lịch sử mua hàng của bạn.'}
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
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
