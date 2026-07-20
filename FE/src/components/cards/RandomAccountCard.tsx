'use client';

import Link from 'next/link';
import type { Account } from '@/types/index.type';
import { buildAccountDetailUrl } from '@/utils/format-slug.util';
import { getVideoMimeType, isVideo } from '@/utils/media.util';

interface RandomAccountCardProps {
  account: Account;
  typeName?: string;
  typeSlug?: string;
}

export function RandomAccountCard({
  account,
  typeName = 'Random',
  typeSlug,
}: RandomAccountCardProps) {
  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const detailUrl = buildAccountDetailUrl(account, 'thu-van-may');

  // Get media URL
  const mediaUrl =
    account.coverImage ||
    (account.images && account.images.length > 0 ? account.images[0] : '/images/placeholder.svg');
  const mediaIsVideo = isVideo(mediaUrl);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20 hover:border-indigo-500 dark:hover:border-indigo-400">
      {/* Label Badge */}
      <div className="absolute top-0 right-0 z-10 rounded-bl-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
        THỬ VẬN MAY
      </div>

      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden p-1">
        <Link href={detailUrl} className="block w-full h-full relative rounded-lg overflow-hidden">
          {mediaIsVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110"
            >
              <source src={mediaUrl} type={getVideoMimeType(mediaUrl)} />
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt="Random Box"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110"
            />
          )}

          {/* Mystery Overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

          {/* Center Question Mark (Optional decoration) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-4xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] animate-bounce">
              ?
            </span>
          </div>
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center p-3 text-center">
        <div className="mb-2">
          <h3 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
            {typeName}
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            Cơ hội trúng Acc VIP
          </p>
        </div>

        <div className="mb-3 w-full border-t border-dashed border-indigo-200 dark:border-indigo-800 my-2" />

        <div className="w-full flex items-center justify-between px-2">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
            {formatPrice(account.price)}
          </span>

          <Link href={detailUrl}>
            <button className="rounded-full bg-indigo-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-indigo-300 dark:shadow-none hover:bg-indigo-700 transition-colors active:scale-95">
              CHƠI NGAY
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
