import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimationConfig } from '../utils/featureFlags';

export type AnimationSlot = {
  id: string;
  startedAt: number;
  release: () => void;
  index: number;
};

type AnimationPoolContextValue = {
  requestSlot: (ttlMs?: number) => AnimationSlot | null;
  activeCount: number;
  staggerDelay: (index: number) => number;
};

const AnimationPoolContext = createContext<AnimationPoolContextValue | undefined>(undefined);

export const AnimationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeSlots, setActiveSlots] = useState<AnimationSlot[]>([]);
  const counterRef = useRef(0);

  const evictExpired = useCallback(() => {
    const now = Date.now();
    setActiveSlots((slots) => slots.filter((slot) => now - slot.startedAt < AnimationConfig.alertTtlMs));
  }, []);

  useEffect(() => {
    const timer = setInterval(evictExpired, AnimationConfig.alertTtlMs / 2);
    return () => clearInterval(timer);
  }, [evictExpired]);

  const releaseSlot = useCallback((id: string) => {
    setActiveSlots((slots) => slots.filter((slot) => slot.id !== id));
  }, []);

  const requestSlot = useCallback(
    (ttlMs: number = AnimationConfig.alertTtlMs): AnimationSlot | null => {
      let slot: AnimationSlot | null = null;
      setActiveSlots((slots) => {
        let next = slots;
        if (slots.length >= AnimationConfig.maxConcurrentAnims) {
          const sorted = [...slots].sort((a, b) => a.startedAt - b.startedAt);
          sorted.shift();
          next = sorted;
        }

        const id = `anim-${Date.now()}-${counterRef.current++}`;
        slot = {
          id,
          startedAt: Date.now(),
          index: next.length,
          release: () => releaseSlot(id),
        };
        return [...next, slot];
      });

      if (slot) {
        setTimeout(() => releaseSlot(slot!.id), ttlMs);
      }

      return slot;
    },
    [releaseSlot],
  );

  const value = useMemo(
    () => ({
      requestSlot,
      activeCount: activeSlots.length,
      staggerDelay: (index: number) => index * AnimationConfig.staggerDelayMs,
    }),
    [activeSlots.length, requestSlot],
  );

  return <AnimationPoolContext.Provider value={value}>{children}</AnimationPoolContext.Provider>;
};

export const useAnimationPool = (): AnimationPoolContextValue => {
  const ctx = useContext(AnimationPoolContext);
  if (!ctx) {
    throw new Error('useAnimationPool must be used within AnimationProvider');
  }
  return ctx;
};

export default AnimationProvider;
