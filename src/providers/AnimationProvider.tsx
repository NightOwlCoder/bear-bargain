import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimationConfig } from '../utils/featureFlags';

interface AnimationSlot {
  id: string;
  expiresAt: number;
}

interface AnimationPoolContextValue {
  requestSlot: (ttlMs?: number) => Promise<{ id: string; release: () => void }>;
  activeCount: number;
}

const AnimationPoolContext = createContext<AnimationPoolContextValue | undefined>(undefined);

const createSlotId = () => `anim-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const AnimationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [slots, setSlots] = useState<AnimationSlot[]>([]);
  const slotsRef = useRef<AnimationSlot[]>([]);

  const evictExpired = useCallback(() => {
    const now = Date.now();
    setSlots((current) => {
      const filtered = current.filter((slot) => slot.expiresAt > now);
      slotsRef.current = filtered;
      return filtered;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(evictExpired, AnimationConfig.staggerDelayMs * 4);
    return () => clearInterval(interval);
  }, [evictExpired]);

  const requestSlot = useCallback<AnimationPoolContextValue['requestSlot']>(
    async (ttlMs = AnimationConfig.alertTtlMs) => {
      const delay = Math.min(slotsRef.current.length, AnimationConfig.maxConcurrentAnims) * AnimationConfig.staggerDelayMs;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const slotId = createSlotId();
      const expiresAt = Date.now() + ttlMs;

      setSlots((current) => {
        let next = current.filter((slot) => slot.expiresAt > Date.now());
        if (next.length >= AnimationConfig.maxConcurrentAnims) {
          next = next.slice(1);
        }
        const updated = [...next, { id: slotId, expiresAt }];
        slotsRef.current = updated;
        return updated;
      });

      const release = () => {
        setSlots((current) => {
          const updated = current.filter((slot) => slot.id !== slotId);
          slotsRef.current = updated;
          return updated;
        });
      };

      setTimeout(release, ttlMs);

      return { id: slotId, release };
    },
    [],
  );

  const value = useMemo<AnimationPoolContextValue>(
    () => ({
      requestSlot,
      activeCount: slots.length,
    }),
    [requestSlot, slots.length],
  );

  return <AnimationPoolContext.Provider value={value}>{children}</AnimationPoolContext.Provider>;
};

export const useAnimationPool = () => {
  const context = useContext(AnimationPoolContext);
  if (!context) {
    throw new Error('useAnimationPool must be used within an AnimationProvider');
  }
  return context;
};
