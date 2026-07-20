"use client";

import {
  Calendar,
  ChevronDown,
  Leaf,
  Snowflake,
  Sparkles,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSeason } from "@/contexts/season-context";
import useClickOutSide from "@/hooks/useClickOutSide";
import type { Season } from "@/types/seasonal.type";

const SEASON_OPTIONS = [
  {
    value: "auto" as const,
    label: "Tự động",
    icon: Calendar,
    iconClass: "text-purple-500",
    bgClass: "bg-purple-50 dark:bg-purple-900/20",
    hoverClass: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
  },
  {
    value: "spring" as Season,
    label: "Xuân",
    icon: Sparkles,
    iconClass: "text-pink-500",
    bgClass: "bg-pink-50 dark:bg-pink-900/20",
    hoverClass: "hover:bg-pink-50 dark:hover:bg-pink-900/20",
  },
  {
    value: "summer" as Season,
    label: "Hè",
    icon: Sun,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-50 dark:bg-orange-900/20",
    hoverClass: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
  },
  {
    value: "autumn" as Season,
    label: "Thu",
    icon: Leaf,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
    hoverClass: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
  },
  {
    value: "winter" as Season,
    label: "Đông",
    icon: Snowflake,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    hoverClass: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
  },
];

export default function SeasonSelector() {
  const { season, setSeason, isAuto, effectsEnabled, toggleEffects } =
    useSeason();
  const [isOpen, setIsOpen] = useState(false);

  const { nodeRef } = useClickOutSide(() => setIsOpen(false));

  const currentOption = isAuto
    ? SEASON_OPTIONS[0]
    : SEASON_OPTIONS.find((opt) => opt.value === season) || SEASON_OPTIONS[0];

  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={nodeRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
          isOpen
            ? `${currentOption.bgClass} ring-2 ring-offset-2 ring-purple-500/30`
            : currentOption.hoverClass
        }`}
      >
        <CurrentIcon className={`w-4 h-4 ${currentOption.iconClass}`} />
        <span className="hidden sm:inline text-xs font-semibold">
          {currentOption.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1 space-y-1">
            {SEASON_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected =
                (isAuto && option.value === "auto") ||
                (!isAuto && option.value === season);

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setSeason(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isSelected
                      ? `${option.bgClass} ${option.iconClass}`
                      : `text-muted-foreground ${option.hoverClass}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                  {isSelected && <span className="ml-auto text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-2 my-1 border-t border-border/40" />

          {/* Effects Toggle */}
          <div className="p-1">
            <button
              onClick={() => {
                toggleEffects();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                effectsEnabled
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span>Hiệu ứng</span>
              <span
                className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                  effectsEnabled
                    ? "bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800/30 text-gray-500"
                }`}
              >
                {effectsEnabled ? "Bật" : "Tắt"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
