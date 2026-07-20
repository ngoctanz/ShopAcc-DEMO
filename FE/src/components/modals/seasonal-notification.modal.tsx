"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import {
  type Notification,
  notificationService,
} from "@/services/notification.service";
import AutumnModalContent from "./autumn-nofitication.modal";
import SummerModalContent from "./summer-nofitication.modal";
import WinterModalContent from "./winter-nofitication.modal";

// Type mapping for notification badges
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  system: "Hệ Thống",
  promotion: "Khuyến Mãi",
  maintenance: "Bảo Trì",
  news: "Tin Tức",
  order: "Đơn Hàng",
  topup: "Nạp Tiền",
};

// Helper function to get notification type label
function getNotificationTypeLabel(type?: string): string {
  if (!type) return "Thông Báo";
  return NOTIFICATION_TYPE_LABELS[type] || "Thông Báo";
}

export default function SeasonalNotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const { season } = useSeason();

  useEffect(() => {
    // Fetch latest notification
    const fetchNotification = async () => {
      try {
        const data = await notificationService.getLatestNotification();
        if (data) {
          setNotification(data);
          // Only open modal if we have a notification
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to load seasonal notification", error);
      }
    };

    fetchNotification();
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const latestNotification = notification || ({} as Notification); // Fallback safe check

  const isSpringModal = useMemo(() => season === "spring", [season]);
  const isWinterModal = useMemo(() => season === "winter", [season]);
  const isSummerModal = useMemo(() => season === "summer", [season]);
  const isAutumnModal = useMemo(() => season === "autumn", [season]);

  const modalMaxWidth = useMemo(
    () =>
      isSpringModal || isWinterModal || isSummerModal || isAutumnModal
        ? "max-w-4xl"
        : "max-w-2xl",
    [isSpringModal, isWinterModal, isSummerModal, isAutumnModal]
  );
  const typeLabel = useMemo(
    () => getNotificationTypeLabel(latestNotification.type),
    [latestNotification.type]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${modalMaxWidth} relative animate-in zoom-in-95 duration-200 ${
          isSpringModal || isWinterModal || isSummerModal || isAutumnModal
            ? "bg-transparent shadow-none"
            : "bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isSpringModal ? (
          <SpringModalContent
            notification={latestNotification}
            typeLabel={typeLabel}
            onClose={handleClose}
          />
        ) : isWinterModal ? (
          <WinterModalContent
            notification={latestNotification}
            typeLabel={typeLabel}
            onClose={handleClose}
          />
        ) : isSummerModal ? (
          <SummerModalContent
            notification={latestNotification}
            typeLabel={typeLabel}
            onClose={handleClose}
          />
        ) : isAutumnModal ? (
          <AutumnModalContent
            notification={latestNotification}
            typeLabel={typeLabel}
            onClose={handleClose}
          />
        ) : (
          <DefaultModalContent
            notification={latestNotification}
            typeLabel={typeLabel}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

// Spring/Tet Theme Modal Component
function SpringModalContent({
  notification,
  typeLabel,
  onClose,
}: {
  notification: Notification;
  typeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="relative w-full aspect-[4/3] flex flex-col items-center">
      <Image
        src="/images/themes/notification_bg_tet.png"
        alt="Tet Background"
        fill
        className="object-fill z-0"
        priority
      />

      {/* Content Area - Adjusted to stay within the decorative borders of the BG */}
      <div className="absolute top-[46%] sm:top-[48%] left-1/2 w-[75%] sm:w-[65%] md:w-[55%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center px-2 text-center max-h-[50%] sm:max-h-[55%]">
        <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase mb-1 sm:mb-2 tracking-widest flex-shrink-0 italic">
          {typeLabel.toUpperCase()}
        </h2>

        <div className="w-full flex-1 overflow-y-auto custom-scrollbar-tet px-2">
          <div className="space-y-1 sm:space-y-2 pb-2">
            <h3 className="text-[10px] sm:text-base md:text-lg font-bold text-white drop-shadow-lg leading-tight line-clamp-2">
              {notification.title}
            </h3>

            <div className="text-[9px] sm:text-sm md:text-base leading-snug font-medium text-white/90 drop-shadow-md">
              <p className="line-clamp-4 sm:line-clamp-6">
                {notification.message}
              </p>
            </div>

            {notification.link && (
              <div className="pt-1">
                <a
                  href={notification.link}
                  className="inline-block hover:scale-105 transition-transform active:scale-95"
                >
                  <span className="bg-gradient-to-r from-[#FFD700] to-[#FDB913] text-[#990000] px-3 sm:px-5 py-0.5 sm:py-1 rounded-full font-black text-[8px] sm:text-xs shadow-[0_2px_0_#990000] border border-white/40 uppercase">
                    XEM CHI TIẾT
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="hidden sm:block text-[#FFD700] font-black text-[8px] md:text-[10px] uppercase drop-shadow-lg mt-2 flex-shrink-0 tracking-[0.1em] border-t border-[#FFD700]/20 pt-1">
          Chúc bạn năm mới Vạn Sự Như Ý
        </p>
      </div>

      {/* Action Button - Lowered slightly and shrunk */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] z-20">
        <button
          onClick={onClose}
          className="cursor-pointer group relative flex items-center justify-center transform scale-90 sm:scale-100"
        >
          <div className="absolute inset-0 bg-white/10 blur-sm rounded-full group-hover:bg-white/20 transition-all"></div>
          <span className="relative bg-gradient-to-b from-[#FFD700] to-[#FDB913] hover:from-[#ffe033] hover:to-[#ffc44d] text-[#990000] font-black py-1 sm:py-2 px-8 sm:px-12 rounded-full shadow-[0_2px_0_#920000] hover:shadow-[0_1px_0_#920000] active:shadow-none active:translate-y-0.5 transition-all text-xs sm:text-base border border-white/50 uppercase">
            ĐÃ HIỂU
          </span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar-tet::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-tet::-webkit-scrollbar-track {
          background: rgba(153, 0, 0, 0.1);
        }
        .custom-scrollbar-tet::-webkit-scrollbar-thumb {
          background: #ffd700;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// Default Theme Modal Component
function DefaultModalContent({
  notification,
  typeLabel,
  onClose,
}: {
  notification: Notification;
  typeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="relative w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800 shadow-xl">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 py-3 px-6 text-center">
        <p className="text-white font-black text-sm sm:text-base tracking-[0.3em] uppercase">
          {typeLabel.toUpperCase()}
        </p>
      </div>

      {/* Type Badge */}
      <div className="flex justify-center -mt-3 mb-6">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-4 py-1.5 shadow-md border border-blue-200 dark:border-blue-700">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Icon & Title */}
      <div className="text-center px-6 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500 dark:bg-blue-600 shadow-lg mb-4">
          <BellIcon />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {notification.title}
        </h2>

        <div className="flex justify-center">
          <div className="h-1 w-20 bg-blue-500 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-10 py-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MessageIcon />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Nội dung
            </p>
          </div>

          <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed pl-11">
            {notification.message}
          </p>

          {notification.link && (
            <div className="mt-6 flex justify-center">
              <a
                href={notification.link}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md"
              >
                <span>Xem Chi Tiết</span>
                <ChevronRightIcon />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 flex justify-center border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onClose}
          className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors shadow-md"
        >
          ĐÓNG
        </button>
      </div>
    </div>
  );
}

// Icon Components
function BellIcon() {
  return (
    <svg
      className="w-8 h-8 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      className="w-4 h-4 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
