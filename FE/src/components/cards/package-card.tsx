'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { AccountPackage } from '@/types/index.type';
import { formatCurrency } from '@/utils/format';
import { getVideoMimeType, isVideo } from '@/utils/media.util';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

interface PackageCardProps {
  pkg: AccountPackage;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const isRandom = pkg.mode === 'RANDOM';
  const isClone = pkg.mode === 'CLONE';

  // Determine href based on mode
  // LIST and CLONE both go to /[slug], only RANDOM goes to /random/[slug]
  const href = isRandom
    ? `/random/${pkg.slug || pkg._id}`
    : `/${pkg.slug || pkg._id}`; // LIST and CLONE mode

  const finalPrice = pkg.discountPrice || pkg.price;
  const hasDiscount = pkg.discountPrice && pkg.price && pkg.discountPrice < pkg.price;
  const discountPercent = hasDiscount
    ? Math.round(((pkg.price! - pkg.discountPrice!) / pkg.price!) * 100)
    : 0;

  // Get media URL with fallback to placeholder
  const mediaUrl = pkg.image || PLACEHOLDER_IMAGE;
  const mediaIsVideo = pkg.image ? isVideo(pkg.image) : false;

  return (
    <Link href={href} className="group">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              -{discountPercent}%
            </div>
          </div>
        )}

        {/* Mode Badge */}
        {isRandom && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              HOT
            </div>
          </div>
        )}
        {isClone && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              Reg-Clone
            </div>
          </div>
        )}

        {/* Card Media */}
        <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
          {mediaIsVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            >
              <source src={mediaUrl} type={getVideoMimeType(mediaUrl)} />
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={pkg.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        {/* Card Content */}
        <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          {/* Title */}
          <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm sm:text-base md:text-lg">
            {pkg.title}
          </h3>

          {/* Price - Only show for RANDOM mode */}
          {isRandom && pkg.price && (
            <div className="flex items-end gap-1 sm:gap-2">
              <span className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {formatCurrency(finalPrice!)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through mb-0.5">
                  {formatCurrency(pkg.price)}
                </span>
              )}
            </div>
          )}

          {/* Account Count */}
          <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded bg-muted/50">
            <span className="text-xs sm:text-sm font-medium text-foreground">Còn lại</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm sm:text-base font-black text-foreground">
                {pkg.accountCount || 0}
              </span>
            </div>
          </div>

          {/* CTA Button - RANDOM uses different button, LIST and CLONE use same */}
          {isRandom ? (
            <div className="mt-1.5 sm:mt-2 mb-0.5 sm:mb-1 flex justify-center group-hover:-translate-y-0.5 transition-transform duration-300">
              <Image
                src="/gifs/button_random.png"
                alt="Bóc ngay"
                width={350}
                height={40}
                className="w-4/5 max-w-[300px] h-auto rounded group-hover:brightness-110 transition-all"
                unoptimized
              />
            </div>
          ) : (
            /* LIST and CLONE mode - same button */
            <div className="mt-1.5 sm:mt-2 mb-0.5 sm:mb-1 flex justify-center group-hover:-translate-y-0.5 transition-transform duration-300">
              <Image
                src="/gifs/button_seemore.gif"
                alt="Xem danh sách"
                width={350}
                height={40}
                className="w-4/5 max-w-[300px] h-auto rounded group-hover:brightness-110 transition-all"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
