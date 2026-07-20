'use client';

import { AlertCircle, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRateLimit } from '@/hooks/useRateLimit';
import { cn } from '@/lib/utils';
import type { AccountPackage } from '@/types/index.type';
import { formatCurrency } from '@/utils/format';

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pkg: AccountPackage;
  userBalance?: number;
  isProcessing?: boolean;
}

export default function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  pkg,
  userBalance = 0,
  isProcessing = false,
}: ConfirmPurchaseModalProps) {
  const finalPrice = pkg.discountPrice || pkg.price || 0;
  const hasDiscount = pkg.discountPrice && pkg.price && pkg.discountPrice < pkg.price;
  const balanceAfter = userBalance - finalPrice;
  const isInsufficient = balanceAfter < 0;

  // Rate limit để chặn bấm quá nhanh
  const { checkRateLimit } = useRateLimit({
    cooldown: 3000,
    showCountdown: false,
    warningMessage: 'Bấm quá nhanh! Vui lòng đợi',
  });

  const handleConfirm = useCallback(() => {
    if (!checkRateLimit()) return;
    onConfirm();
  }, [checkRateLimit, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-6 text-center text-white">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm border border-white/20 hidden sm:flex">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold">Xác nhận mở túi mù</DialogTitle>
          <DialogDescription className="text-slate-300 text-xs mt-1">
            Giao dịch sẽ được xử lý tự động ngay lập tức
          </DialogDescription>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-white dark:bg-zinc-900">
          {/* Package Info */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
            {pkg.image ? (
              <div className="w-12 h-12 relative rounded-md overflow-hidden bg-slate-200 shrink-0">
                <img src={pkg.image} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-orange-400 to-red-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">
                {pkg.title}
              </p>
              <p className="text-xs text-red-500 font-bold mt-0.5">
                {formatCurrency(finalPrice)}
                {hasDiscount && (
                  <span className="ml-2 text-slate-400 line-through text-[10px]">
                    {formatCurrency(pkg.price || 0)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Balance Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Thanh toán bằng số dư
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 uppercase font-bold tracking-wider mb-0.5">
                  Số dư hiện tại
                </p>
                <p className="font-mono font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(userBalance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 uppercase font-bold tracking-wider mb-0.5">
                  Sau thanh toán
                </p>
                <p
                  className={cn(
                    'font-mono font-bold',
                    isInsufficient ? 'text-red-500' : 'text-green-600'
                  )}
                >
                  {formatCurrency(balanceAfter)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning if insufficient */}
          {isInsufficient && (
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">
                  Số dư không đủ thanh toán
                </p>
                <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-snug">
                  Vui lòng nạp thêm tối thiểu{' '}
                  <span className="font-bold">{formatCurrency(Math.abs(balanceAfter))}</span> để mở
                  túi mù này.
                </p>
                <Link
                  href="/user/nap-tien"
                  className="inline-flex items-center text-xs font-bold text-red-700 hover:text-red-800 hover:underline mt-1"
                >
                  Nạp tiền ngay →
                </Link>
              </div>
            </div>
          )}

          {/* Summary */}
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
              <span className="text-xl font-black text-red-600">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-700 gap-3 grid grid-cols-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full text-slate-600"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || isInsufficient}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận mở'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
