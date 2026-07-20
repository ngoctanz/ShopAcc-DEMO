'use client';

import { useSeason } from '@/contexts/season-context';
import type { Season } from '@/types/seasonal.type';
import { HEADER_DECORATIONS } from './assets';

export default function HeaderSeasonalDecor() {
  const { season } = useSeason();

  const decor = HEADER_DECORATIONS[season as Season];

  if (!decor || (!decor.left && !decor.right)) return null;

  const sizeClass = season === 'summer' ? 'h-[160px] md:h-[280px]' : 'h-[140px] md:h-[230px]';

  return (
    <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-[100] overflow-visible">
      {decor.left && (
        <img
          src={decor.left}
          alt="Seasonal Decoration Left"
          className={`hidden lg:block absolute top-0 left-0 ${sizeClass} w-auto object-contain transition-all duration-1000 ease-in-out hover:scale-105`}
        />
      )}
      {decor.right && (
        <img
          src={decor.right}
          alt="Seasonal Decoration Right"
          className={`hidden min-[1400px]:block absolute top-0 right-0 ${sizeClass} w-auto object-contain opacity-100 transition-all duration-1000 ease-in-out hover:scale-105`}
        />
      )}
    </div>
  );
}
