'use client';

import ParticleEffect from './ParticleEffect';

const IMAGE_SOURCES = ['/images/themes/hoamai.png', '/images/themes/hoadao.png'];

const SPRING_CONFIG = {
  snowflakeCount: { mobile: 8, desktop: 12 },
  speed: {
    mobile: [0.2, 0.6] as [number, number],
    desktop: [0.4, 0.8] as [number, number],
  },
  wind: [-0.5, 1.5] as [number, number],
  radius: {
    mobile: [20, 35] as [number, number],
    desktop: [35, 60] as [number, number],
  },
};

export default function SpringEffect() {
  return <ParticleEffect imageSources={IMAGE_SOURCES} {...SPRING_CONFIG} />;
}
