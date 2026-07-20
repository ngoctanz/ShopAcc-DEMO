'use client';

import Image from 'next/image';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}

interface SummerModalContentProps {
  notification: Notification;
  typeLabel?: string;
  onClose: () => void;
}

export default function SummerModalContent({
  notification,
  typeLabel = 'Thông Báo',
  onClose,
}: SummerModalContentProps) {
  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[4/3.5] md:aspect-[4/3] flex flex-col items-center">
      <Image
        src="/images/themes/notification_bg_summer.png"
        alt="Summer Background"
        fill
        className="object-contain sm:object-fill z-0"
        priority
      />

      {/* Content Area - Summer Theme Styles */}
      <div className="absolute top-[46%] sm:top-[48%] left-1/2 w-[75%] sm:w-[65%] md:w-[55%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center px-4 text-center max-h-[50%] sm:max-h-[55%]">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-[#ff4d00] drop-shadow-[0_2px_2px_rgba(255,255,255,0.9)] uppercase mb-1 sm:mb-2 tracking-widest flex-shrink-0 italic">
          {typeLabel.toUpperCase()}
        </h2>

        <div className="w-full flex-1 overflow-y-auto custom-scrollbar-summer px-2">
          <div className="space-y-1 sm:space-y-2 pb-2">
            <h3 className="text-xs sm:text-base md:text-xl font-bold text-[#003366] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] leading-tight line-clamp-2">
              {notification.title}
            </h3>

            <div className="text-[10px] sm:text-sm md:text-lg leading-snug font-bold text-[#004080] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
              <p className="line-clamp-5 sm:line-clamp-8">{notification.message}</p>
            </div>

            {notification.link && (
              <div className="pt-2">
                <a
                  href={notification.link}
                  className="inline-block hover:scale-105 transition-transform active:scale-95"
                >
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-1 sm:py-1.5 rounded-full font-black text-[10px] sm:text-xs shadow-[0_3px_0_#990000] border border-white/40 uppercase">
                    XEM CHI TIẾT
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="hidden sm:block text-[#cc3300] font-black text-[10px] md:text-[12px] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] mt-3 flex-shrink-0 tracking-[0.2em] border-t border-orange-400/30 pt-1">
          Chúc bạn một mùa hè rực rỡ
        </p>
      </div>

      {/* Action Button - Summer Style */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] z-20">
        <button
          onClick={onClose}
          className="cursor-pointer group relative flex items-center justify-center transform scale-90 sm:scale-100"
        >
          <div className="absolute inset-0 bg-orange-400/20 blur-md rounded-full group-hover:bg-orange-400/30 transition-all"></div>
          <span className="relative bg-gradient-to-b from-orange-400 to-red-600 hover:from-orange-300 hover:to-red-500 text-white font-black py-1.5 sm:py-2.5 px-10 sm:px-16 rounded-full shadow-[0_3px_0_#9a3412] hover:shadow-[0_1px_0_#9a3412] active:shadow-none active:translate-y-0.5 transition-all text-xs sm:text-base border border-white/50 uppercase">
            ĐÃ HIỂU
          </span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar-summer::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-summer::-webkit-scrollbar-track {
          background: rgba(255, 165, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar-summer::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
