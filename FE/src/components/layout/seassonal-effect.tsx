'use client';

import { useSeason } from '@/contexts/season-context';
import AutumnEffect from './seasonal/AutumnEffect';
import SpringEffect from './seasonal/SpringEffect';
import SummerEffect from './seasonal/SummerEffect';
import WinterEffect from './seasonal/WinterEffect';

export default function SeasonalEffect() {
  const { season } = useSeason();

  switch (season) {
    case 'spring':
      return <SpringEffect />;
    case 'summer':
      return <SummerEffect />;
    case 'autumn':
      return <AutumnEffect />;
    case 'winter':
      return <WinterEffect />;
    default:
      return <WinterEffect />;
  }
}
