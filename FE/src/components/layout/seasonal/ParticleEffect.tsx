"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Snowfall from "react-snowfall";
import { useSeason } from "@/contexts/season-context";

interface ParticleEffectProps {
  imageSources: string[];
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

const ParticleEffect = memo(
  ({
    imageSources,
    snowflakeCount,
    speed,
    wind,
    radius,
  }: ParticleEffectProps) => {
    const { effectsEnabled } = useSeason();
    const [images, setImages] = useState<HTMLImageElement[] | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      imageSources.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imageSources.length) {
            setImages(loadedImages);
          }
        };
        loadedImages.push(img);
      });

      return () => {
        setImages(null);
      };
    }, [imageSources]);

    const currentSpeed = useMemo(
      () => (isMobile ? speed.mobile : speed.desktop),
      [isMobile, speed]
    );

    const currentRadius = useMemo(
      () => (isMobile ? radius.mobile : radius.desktop),
      [isMobile, radius]
    );

    const currentCount = useMemo(
      () => (isMobile ? snowflakeCount.mobile : snowflakeCount.desktop),
      [isMobile, snowflakeCount]
    );

    const style = useMemo<React.CSSProperties>(
      () => ({
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none",
      }),
      []
    );

    if (!effectsEnabled) return null;
    if (!images) return null;

    return (
      <Snowfall
        images={images}
        snowflakeCount={currentCount}
        speed={currentSpeed}
        wind={wind}
        radius={currentRadius}
        style={style}
      />
    );
  }
);

ParticleEffect.displayName = "ParticleEffect";

export default ParticleEffect;
