'use client';

import { useEffect, useState } from 'react';
import type { Account, AccountPackage } from '@/types/index.type';

interface LuckyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  package: AccountPackage | null;
}

export default function LuckyResultModal({
  isOpen,
  onClose,
  account,
  package: pkg,
}: LuckyResultModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [isOpen]);

  if (!isOpen || !account || !pkg) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Subtle Confetti - Reduced amount */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
                backgroundColor: ['#FFD700', '#FDB913', '#FF6B6B', '#FFA07A'][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-scale-in border border-gray-200 dark:border-zinc-800 flex flex-col">
        {/* Header - Softer gradient */}
        <div className="bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-orange-950/40 p-5 lg:p-8 text-center relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1">Chúc Mừng!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">
              Bạn đã nhận được tài khoản từ {pkg.title}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-3 lg:space-y-5 overflow-y-auto flex-1">
          {/* Account info card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-3 lg:p-5 border border-gray-200 dark:border-zinc-700">
            {/* Account details */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Mã tài khoản</span>
                <span className="font-mono font-bold text-sm lg:text-base text-gray-900 dark:text-white">
                  {account.code}
                </span>
              </div>

              {account.accountInfo && (
                <div className="pt-2 lg:pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Thông tin tài khoản
                  </p>
                  <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-zinc-800 rounded-lg p-2 lg:p-3 border border-gray-200 dark:border-zinc-700">
                    {account.accountInfo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info note - Softer colors */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3 lg:p-4">
            <div className="flex items-start gap-2 lg:gap-3">
              <span className="text-blue-500 text-base lg:text-lg flex-shrink-0">ℹ️</span>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Thông tin chi tiết tài khoản đã được lưu vào hệ thống. Bạn có thể xem lại bất cứ lúc
                nào trong mục &quot;Tài khoản của tôi&quot;.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 lg:gap-3 pt-1 lg:pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 lg:py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold text-sm lg:text-base rounded-xl transition-colors border border-gray-200 dark:border-zinc-700"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                window.location.href = `/user/lich-su-mua-hang`;
              }}
              className="flex-1 py-2.5 lg:py-3 bg-gradient-to-r from-rose-500 to-orange-500 dark:from-yellow-500 dark:to-orange-500 hover:from-rose-600 hover:to-orange-600 dark:hover:from-yellow-600 dark:hover:to-orange-600 text-white font-bold text-sm lg:text-base rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
