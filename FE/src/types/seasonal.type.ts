export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonConfig {
  text: string;
  subtext: string;
  gradient: string;
  dividerStart: string;
  dividerEnd: string;
}

export interface HeaderDecoration {
  left?: string;
  right?: string;
}

export interface ParticleEffectConfig {
  images: string[];
  snowflakeCount: {
    mobile: number;
    desktop: number;
  };
  speed: {
    mobile: [number, number];
    desktop: [number, number];
  };
  wind: [number, number];
  radius: {
    mobile: [number, number];
    desktop: [number, number];
  };
}
