'use client';

interface ErrorResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function ErrorResultModal({
  isOpen,
  onClose,
  message = 'Đã có lỗi xảy ra, vui lòng thử lại sau',
}: ErrorResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-100 via-rose-50 to-orange-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-orange-950/40 p-6 text-center relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Oops!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Có lỗi xảy ra rồi</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error image */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/system_notification/error1.png"
              alt="Error"
              className="w-40 h-40 object-contain"
            />
          </div>

          {/* Error message */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-center">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">{message}</p>
          </div>

          {/* Action */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Đóng
          </button>
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
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
