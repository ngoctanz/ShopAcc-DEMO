import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseRateLimitOptions {
  /** Cooldown time in milliseconds (default: 3000ms) */
  cooldown?: number;
  /** Show countdown on button (default: false) */
  showCountdown?: boolean;
  /** Custom warning message */
  warningMessage?: string;
  /** Show toast warning when rate limited (default: true) */
  showWarning?: boolean;
}

interface UseRateLimitReturn {
  /** Check if action is allowed, returns false if rate limited */
  checkRateLimit: (key?: string) => boolean;
  /** Get remaining cooldown seconds for a key (0 if not in cooldown) */
  getCooldown: (key?: string) => number;
  /** Check if a key is currently in cooldown */
  isInCooldown: (key?: string) => boolean;
  /** Cooldown state for all keys (for countdown display) */
  cooldowns: Record<string, number>;
  /** Reset cooldown for a specific key */
  resetCooldown: (key?: string) => void;
}

const DEFAULT_KEY = '__default__';

/**
 * Hook to prevent users from clicking too fast
 *
 * @example
 * // Simple usage (no countdown)
 * const { checkRateLimit, isInCooldown } = useRateLimit({ cooldown: 3000 });
 *
 * const handleClick = () => {
 *   if (!checkRateLimit()) return;
 *   // do something
 * };
 *
 * @example
 * // With countdown display
 * const { checkRateLimit, cooldowns } = useRateLimit({
 *   cooldown: 5000,
 *   showCountdown: true
 * });
 *
 * const handleClick = (id: string) => {
 *   if (!checkRateLimit(id)) return;
 *   // do something
 * };
 *
 * // In JSX:
 * <Button disabled={!!cooldowns[id]}>
 *   {cooldowns[id] ? `${cooldowns[id]}s` : 'Click'}
 * </Button>
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const {
    cooldown = 3000,
    showCountdown = false,
    warningMessage = 'Bấm quá nhanh! Vui lòng đợi',
    showWarning = true,
  } = options;

  const lastActionTimeRef = useRef<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const checkRateLimit = useCallback(
    (key: string = DEFAULT_KEY): boolean => {
      const now = Date.now();
      const lastAction = lastActionTimeRef.current[key] || 0;
      const timeSinceLastAction = now - lastAction;

      if (timeSinceLastAction < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLastAction) / 1000);

        if (showWarning) {
          toast.warning(`${warningMessage} ${remaining}s`);
        }

        return false;
      }

      // Update last action time
      lastActionTimeRef.current[key] = now;

      // Start countdown if enabled
      if (showCountdown) {
        // Clear existing interval for this key
        if (intervalsRef.current[key]) {
          clearInterval(intervalsRef.current[key]);
        }

        const cooldownSeconds = Math.ceil(cooldown / 1000);
        setCooldowns((prev) => ({ ...prev, [key]: cooldownSeconds }));

        intervalsRef.current[key] = setInterval(() => {
          setCooldowns((prev) => {
            const newVal = (prev[key] || 0) - 1;
            if (newVal <= 0) {
              clearInterval(intervalsRef.current[key]);
              delete intervalsRef.current[key];
              const { [key]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [key]: newVal };
          });
        }, 1000);
      }

      return true;
    },
    [cooldown, showCountdown, showWarning, warningMessage]
  );

  const getCooldown = useCallback(
    (key: string = DEFAULT_KEY): number => {
      return cooldowns[key] || 0;
    },
    [cooldowns]
  );

  const isInCooldown = useCallback(
    (key: string = DEFAULT_KEY): boolean => {
      const now = Date.now();
      const lastAction = lastActionTimeRef.current[key] || 0;
      return now - lastAction < cooldown;
    },
    [cooldown]
  );

  const resetCooldown = useCallback((key: string = DEFAULT_KEY) => {
    delete lastActionTimeRef.current[key];
    if (intervalsRef.current[key]) {
      clearInterval(intervalsRef.current[key]);
      delete intervalsRef.current[key];
    }
    setCooldowns((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    checkRateLimit,
    getCooldown,
    isInCooldown,
    cooldowns,
    resetCooldown,
  };
}

export default useRateLimit;
