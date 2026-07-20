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

interface AutumnModalContentProps {
  notification: Notification;
  typeLabel?: string;
  onClose: () => void;
}

export default function AutumnModalContent({
  notification,
  typeLabel = 'Thông Báo',
  onClose,
}: AutumnModalContentProps) {
  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[4/3.5] md:aspect-[4/3] flex flex-col items-center">
      <Image
        src="/images/themes/notification-autumn.modal.png"
        alt="Autumn Background"
        fill
        className="object-contain sm:object-fill z-0"
        priority
      />

      {/* Content Area - Autumn Theme Styles */}
      <div className="absolute top-[46%] sm:top-[48%] left-1/2 w-[75%] sm:w-[65%] md:w-[60%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center px-4 text-center max-h-[50%] sm:max-h-[55%]">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase mb-1 sm:mb-2 tracking-widest flex-shrink-0 italic">
          {typeLabel.toUpperCase()}
        </h2>

        <div className="w-full flex-1 overflow-y-auto custom-scrollbar-autumn px-2">
          <div className="space-y-1 sm:space-y-2 pb-2">
            <h3 className="text-xs sm:text-base md:text-xl font-bold text-[#FFF5E1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight line-clamp-2">
              {notification.title}
            </h3>

            <div className="text-[10px] sm:text-sm md:text-lg leading-snug font-semibold text-orange-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <p className="line-clamp-5 sm:line-clamp-8">{notification.message}</p>
            </div>

            {notification.link && (
              <div className="pt-2">
                <a
                  href={notification.link}
                  className="inline-block hover:scale-105 transition-transform active:scale-95"
                >
                  <span className="bg-gradient-to-r from-orange-400 to-amber-600 text-white px-4 sm:px-6 py-1 sm:py-1.5 rounded-full font-black text-[10px] sm:text-xs shadow-[0_3px_0_#78350f] border border-orange-200/40 uppercase">
                    XEM CHI TIẾT
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="hidden sm:block text-[#FFD700] font-black text-[10px] md:text-[12px] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-3 flex-shrink-0 tracking-[0.2em] border-t border-orange-300/20 pt-1">
          Chúc bạn một mùa thu lãng mạn
        </p>
      </div>

      {/* Action Button - Autumn Style */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] z-20">
        <button
          onClick={onClose}
          className="cursor-pointer group relative flex items-center justify-center transform scale-90 sm:scale-100"
        >
          <div className="absolute inset-0 bg-orange-400/20 blur-md rounded-full group-hover:bg-orange-400/30 transition-all"></div>
          <span className="relative bg-gradient-to-b from-orange-500 to-amber-700 hover:from-orange-400 hover:to-amber-600 text-white font-black py-1.5 sm:py-2.5 px-10 sm:px-16 rounded-full shadow-[0_3px_0_#78350f] hover:shadow-[0_1px_0_#78350f] active:shadow-none active:translate-y-0.5 transition-all text-xs sm:text-base border border-orange-200/50 uppercase">
            ĐÃ HIỂU
          </span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar-autumn::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-autumn::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-autumn::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
