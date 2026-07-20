"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Season } from "@/types/seasonal.type";
import { getSeason } from "@/utils/seasonal.util";

interface SeasonContextType {
  season: Season;
  setSeason: (season: Season | "auto") => void;
  isAuto: boolean;
  effectsEnabled: boolean;
  toggleEffects: () => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>("winter");
  const [isAuto, setIsAuto] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    // Load saved preference from localStorage
    const saved = localStorage.getItem("season-preference");
    if (saved === "auto" || !saved) {
      setSeasonState(getSeason());
      setIsAuto(true);
    } else {
      setSeasonState(saved as Season);
      setIsAuto(false);
    }

    // Load effects preference
    const effectsPref = localStorage.getItem("effects-enabled");
    setEffectsEnabled(effectsPref !== "false");
  }, []);

  const setSeason = (newSeason: Season | "auto") => {
    if (newSeason === "auto") {
      setSeasonState(getSeason());
      setIsAuto(true);
      localStorage.setItem("season-preference", "auto");
    } else {
      setSeasonState(newSeason);
      setIsAuto(false);
      localStorage.setItem("season-preference", newSeason);
    }
  };

  const toggleEffects = () => {
    setEffectsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("effects-enabled", String(newValue));
      return newValue;
    });
  };

  return (
    <SeasonContext.Provider
      value={{ season, setSeason, isAuto, effectsEnabled, toggleEffects }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
}
