"use client";

import { useCallback, useEffect, useState } from "react";
import RedEnvelope from "@/components/lucky-draw/red-envelope.component";
import { useSeason } from "@/contexts/season-context";
import { useRateLimit } from "@/hooks/useRateLimit";
import type { Account, AccountPackage } from "@/types/index.type";
import { formatCurrency } from "@/utils/format";

interface LuckyDrawSectionProps {
  pkg: AccountPackage;
  onPurchase: () => void;
  resultAccount: Account | null;
  isAnimating: boolean;
  onOpenModal: () => void;
  onBack: () => void;
}

export default function LuckyDrawSection({
  pkg,
  onPurchase,
  resultAccount,
  isAnimating,
  onOpenModal,
  onBack,
}: LuckyDrawSectionProps) {
  const { season } = useSeason();
  const [showResult, setShowResult] = useState(false);

  const isSpring = season === "spring";

  // Theme Text & Config
  const theme = {
    background: isSpring
      ? "from-rose-100 via-pink-50 to-orange-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-orange-950/40"
      : "from-slate-100 via-blue-50 to-indigo-50 dark:from-slate-950/40 dark:via-blue-950/30 dark:to-indigo-950/40",
    patternOpacity: isSpring
      ? "opacity-[0.03] dark:opacity-[0.05]"
      : "opacity-[0.02] dark:opacity-[0.04]",
    patternUrl: isSpring
      ? "bg-[url('https://www.transparenttextures.com/patterns/oriental-tiles.png')]"
      : "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]", // Generic technical pattern
    spotlight1: isSpring
      ? "bg-rose-300/20 dark:bg-rose-500/10"
      : "bg-blue-300/20 dark:bg-blue-500/10",
    spotlight2: isSpring
      ? "bg-amber-200/20 dark:bg-amber-500/10"
      : "bg-indigo-300/20 dark:bg-indigo-500/10",
    titleGradient: isSpring
      ? "from-rose-600 to-orange-500 dark:from-yellow-300 dark:to-orange-400"
      : "from-blue-600 to-indigo-600 dark:from-cyan-300 dark:to-blue-400",
    priceTagBg: isSpring
      ? "bg-rose-50 dark:bg-white/5"
      : "bg-blue-50 dark:bg-white/5",
    priceTagText: isSpring
      ? "text-rose-700 dark:text-rose-300"
      : "text-blue-700 dark:text-blue-300",
    priceTagSub: isSpring
      ? "text-rose-600/70 dark:text-rose-400/70"
      : "text-blue-600/70 dark:text-blue-400/70",
    pingColor: isSpring ? "bg-rose-400" : "bg-blue-400",
    dotColor: isSpring ? "bg-rose-500" : "bg-blue-500",
    listBullet: isSpring ? "text-rose-500" : "text-blue-500",
  };

  // Rate limit để chặn bấm quá nhanh
  const { checkRateLimit } = useRateLimit({
    cooldown: 3000,
    showCountdown: false,
    warningMessage: "Bấm quá nhanh! Vui lòng đợi",
  });

  const finalPrice = pkg.discountPrice || pkg.price || 0;
  const hasDiscount =
    pkg.discountPrice && pkg.price && pkg.discountPrice < pkg.price;

  useEffect(() => {
    if (resultAccount && isAnimating) {
      setShowResult(true);
    } else if (!isAnimating) {
      setShowResult(false);
    }
  }, [resultAccount, isAnimating]);

  const handleClick = useCallback(() => {
    if (isAnimating) return;
    if (!checkRateLimit()) return;
    onPurchase();
  }, [isAnimating, checkRateLimit, onPurchase]);

  const handleCardClick = () => {
    if (showResult && resultAccount) {
      onOpenModal();
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen flex flex-col overflow-hidden bg-gradient-to-br ${theme.background}`}
    >
      {/* Background Pattern Overlay */}
      <div
        className={`absolute inset-0 ${theme.patternOpacity} ${theme.patternUrl} pointer-events-none`}
      />

      {/* Subtle Spotlight for depth */}
      <div
        className={`absolute top-1/2 left-1/4 w-[600px] h-[600px] ${theme.spotlight1} blur-[100px] rounded-full pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 right-0 w-[800px] h-[800px] ${theme.spotlight2} blur-[120px] rounded-full pointer-events-none`}
      />

      {/* Back button - Absolute positioned for overlay */}
      <div className="absolute top-8 left-6 lg:top-15 lg:left-25 z-20">
        <button
          onClick={onBack}
          className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 font-bold bg-white/60 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm cursor-pointer"
        >
          <span>←</span>
          Về trang chủ
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mt-24 lg:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* LEFT: ENVELOPE (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end pt-2 pb-8 lg:py-0 lg:mt-32 order-2 lg:order-1 scale-90 lg:scale-100 relative z-20">
            <RedEnvelope
              pkg={pkg}
              isOpening={isAnimating}
              showResult={showResult}
              resultAccount={resultAccount}
              onOpen={handleClick}
              onCardClick={handleCardClick}
              variant={isSpring ? "spring" : "default"}
            />
          </div>

          {/* RIGHT COLUMN: INFO & TEXT */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left order-1 lg:order-2 relative z-10">
            {/* 1. Header Block */}
            <div className="space-y-3 hidden lg:block">
              <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white font-serif leading-none tracking-tight">
                {isSpring ? "LÌ XÌ " : "VẬN MAY "}
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.titleGradient}`}
                >
                  {isSpring ? "PHÁT LỘC" : "BẤT NGỜ"}
                </span>
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-lg mx-auto lg:mx-0">
                {isSpring
                  ? "Thử vận may đầu năm, rước lộc về nhà với hàng ngàn tài khoản game giá trị."
                  : "Cơ hội sở hữu tài khoản game giá trị cực khủng với mức giá siêu hời."}
              </p>
            </div>

            {/* 2. Price Card - Horizontal & Sleek */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-center sm:justify-between gap-4 max-w-xl mx-auto lg:mx-0 w-full mb-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Giá mở bao
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(pkg.price!)}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>

              <div
                className={`flex items-center gap-3 ${theme.priceTagBg} px-4 py-2 rounded-xl`}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.pingColor} opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${theme.dotColor}`}
                  ></span>
                </span>
                <div className="text-left">
                  <p className={`text-xs font-bold ${theme.priceTagText}`}>
                    Còn lại {pkg.accountCount}
                  </p>
                  <p className={`text-[10px] ${theme.priceTagSub}`}>
                    bao may mắn
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Minimal Steps - Horizontal Flow */}
            <div className="flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-white/20">
                  1
                </span>
                <span>Chạm mở</span>
              </div>
              <div className="w-8 h-px bg-gray-300 dark:bg-white/20"></div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-white/20">
                  2
                </span>
                <span>{isSpring ? "Đợi lì xì" : "Đợi kết quả"}</span>
              </div>
              <div className="w-8 h-px bg-gray-300 dark:bg-white/20"></div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-white/20">
                  3
                </span>
                <span>Nhận quà</span>
              </div>
            </div>

            {/* 4. Simple Notes List - Integrated */}
            <div className="mt-2 pt-6 border-t border-gray-200/60 dark:border-white/10 max-w-xl">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1 justify-center lg:justify-start">
                <span>ℹ️</span> Lưu ý quan trọng
              </p>
              <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className={`${theme.listBullet} mt-0.5`}>•</span>
                  <span>Mỗi bao chứa 1 tài khoản game ngẫu nhiên 100%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${theme.listBullet} mt-0.5`}>•</span>
                  <span>Tài khoản & mật khẩu hiện ngay sau khi mở.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${theme.listBullet} mt-0.5`}>•</span>
                  <span>Không hỗ trợ đổi trả với tài khoản random.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
