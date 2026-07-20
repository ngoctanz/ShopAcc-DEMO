'use client';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  featureName = 'Tính năng này',
}: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 p-6 text-center relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Sắp ra mắt!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Đang được phát triển</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Illustration */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/system_notification/error1.png"
              alt="Coming Soon"
              className="w-36 h-36 object-contain"
            />
          </div>

          {/* Message */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              <span className="font-bold">{featureName}</span> đang được team phát triển và sẽ sớm
              ra mắt <span className="text-[10px] opacity-60">(chắc vậy)</span>. Hãy quay lại sau
              nhé!
            </p>
          </div>

          {/* Action */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            Đã hiểu!
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
