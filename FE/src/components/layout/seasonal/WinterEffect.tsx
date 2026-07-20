"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Snowfall from "react-snowfall";
import { useSeason } from "@/contexts/season-context";

const WinterEffect = memo(() => {
  const { effectsEnabled } = useSeason();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const snowflakeCount = useMemo(() => (isMobile ? 30 : 50), [isMobile]);

  const speed = useMemo<[number, number]>(
    () => (isMobile ? [0.2, 0.8] : [0.5, 1.2]),
    [isMobile]
  );

  const radius = useMemo<[number, number]>(
    () => (isMobile ? [1.5, 3.5] : [2.0, 4.5]),
    [isMobile]
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

  return (
    <Snowfall
      color="#ffffff"
      snowflakeCount={snowflakeCount}
      speed={speed}
      wind={[-0.5, 1.0]}
      radius={radius}
      style={style}
    />
  );
});

WinterEffect.displayName = "WinterEffect";

export default WinterEffect;
