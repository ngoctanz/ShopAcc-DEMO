'use client';

import { AUTUMN_ASSETS } from './assets';
import ParticleEffect from './ParticleEffect';

const AUTUMN_CONFIG = {
  snowflakeCount: { mobile: 8, desktop: 12 },
  speed: {
    mobile: [0.3, 0.8] as [number, number],
    desktop: [0.5, 1.2] as [number, number],
  },
  wind: [-0.5, 2.0] as [number, number],
  radius: {
    mobile: [30, 50] as [number, number],
    desktop: [45, 75] as [number, number],
  },
};

export default function AutumnEffect() {
  return <ParticleEffect imageSources={[...AUTUMN_ASSETS]} {...AUTUMN_CONFIG} />;
}
