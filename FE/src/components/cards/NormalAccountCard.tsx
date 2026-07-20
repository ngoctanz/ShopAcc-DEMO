'use client';

import Link from 'next/link';
import type { Account } from '@/types/index.type';
import {
  getAccountInfoFallback,
  hasAccountTags,
  parseAccountTags,
} from '@/utils/account-tags.util';
import { buildAccountDetailUrl } from '@/utils/format-slug.util';
import { getVideoMimeType, isVideo } from '@/utils/media.util';

interface NormalAccountCardProps {
  account: Account;
  typeName?: string;
  typeSlug?: string;
  showQuantity?: boolean; // Show quantity badge for clone accounts
}

export function NormalAccountCard({
  account,
  typeName = 'Account',
  typeSlug,
  showQuantity = false,
}: NormalAccountCardProps) {
  // Calculate potential discount display
  const hasDiscount = account.originalPrice && account.originalPrice > account.price;
  const discountPercent = hasDiscount
    ? Math.round(((account.originalPrice! - account.price) / account.originalPrice!) * 100)
    : 0;

  // Format price
  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const detailUrl = buildAccountDetailUrl(account);

  // Get media URL
  const mediaUrl =
    account.coverImage ||
    (account.images && account.images.length > 0 ? account.images[0] : '/images/placeholder.svg');
  const mediaIsVideo = isVideo(mediaUrl);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={detailUrl} className="block w-full h-full">
          {mediaIsVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
              <source src={mediaUrl} type={getVideoMimeType(mediaUrl)} />
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={account.accountInfo || 'Account Image'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {hasDiscount && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {showQuantity && account.quantity !== undefined && (
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
              <span>SL:</span> {account.quantity}
            </span>
          )}
          {account.status === 'SOLD' && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              ĐÃ BÁN
            </span>
          )}
        </div>

        {/* Code Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <span className="rounded bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-mono font-bold text-white shadow-sm">
            #{account.code}
          </span>
        </div>

        {/* Featured Skins Overlay (Optional) */}
        {account.featuredSkins && account.featuredSkins.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
            <p className="text-xs font-medium text-white line-clamp-1">
              {account.featuredSkins.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3">
        {/* Account Info Tags - Standardized Colors */}
        <div className="mb-2 flex flex-wrap gap-1.5 min-h-[44px] content-start">
          {(() => {
            const tags = parseAccountTags(account.accountInfo || '');

            // If no tags found, show fallback text
            if (!hasAccountTags(account.accountInfo || '')) {
              return (
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {getAccountInfoFallback(account.accountInfo || '')}
                </span>
              );
            }

            // Render tags
            return tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tag.color}`}
              >
                {tag.text}
              </span>
            ));
          })()}
        </div>

        {/* Footer: Price & Action */}
        <div className="mt-auto flex items-end justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(account.originalPrice!)}
              </span>
            )}
            <span className="text-lg font-bold text-red-600 dark:text-red-500">
              {formatPrice(account.price)}
            </span>
          </div>

          {/* Clone accounts go to payment page, others go to detail page */}
          {showQuantity && account.isClone ? (
            <Link href={`/payment/clone/${account._id}`}>
              <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform active:scale-95 group-hover:bg-purple-700 cursor-pointer">
                MUA NGAY
              </button>
            </Link>
          ) : (
            <Link href={detailUrl}>
              <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform active:scale-95 group-hover:bg-blue-700 cursor-pointer">
                CHI TIẾT
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
