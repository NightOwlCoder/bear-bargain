import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimationConfig } from '../utils/featureFlags';

interface AnimationSlot {
  id: string;
  expiresAt: number;
}

interface PendingRequest {
  ttl: number;
  resolve: (slotId: string) => void;
}

interface AnimationContextValue {
  requestSlot: (ttl?: number) => Promise<string>;
  releaseSlot: (slotId: string) => void;
  activeCount: number;
  activeSlots: string[];
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

const createSlotId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `slot-${Math.random().toString(36).slice(2, 10)}`);

const defaultTtl = AnimationConfig.alertTtlMs;

export const AnimationProvider = ({ children }: PropsWithChildren) => {
  const [active, setActive] = useState<AnimationSlot[]>([]);
  const queueRef = useRef<PendingRequest[]>([]);
  const mountedRef = useRef(true);

  const cleanupExpired = useCallback((slots: AnimationSlot[]) => {
    const now = Date.now();
    return slots.filter((slot) => slot.expiresAt > now);
  }, []);

  const releaseSlot = useCallback((slotId: string) => {
    if (!mountedRef.current) return;
    setActive((prev) => {
      const cleaned = cleanupExpired(prev).filter((slot) => slot.id !== slotId);
      const nextRequest = queueRef.current.shift();
      if (nextRequest) {
        const id = createSlotId();
        const expiresAt = Date.now() + nextRequest.ttl;
        setTimeout(() => releaseSlot(id), nextRequest.ttl);
        nextRequest.resolve(id);
        return [...cleaned, { id, expiresAt }];
      }
      return cleaned;
    });
  }, [cleanupExpired]);

  const requestSlot = useCallback(
    (ttl: number = defaultTtl) =>
      new Promise<string>((resolve) => {
        setActive((prev) => {
          const cleaned = cleanupExpired(prev);
          if (cleaned.length < AnimationConfig.maxConcurrentAnims) {
            const id = createSlotId();
            const expiresAt = Date.now() + ttl;
            setTimeout(() => releaseSlot(id), ttl);
            resolve(id);
            return [...cleaned, { id, expiresAt }];
          }
          queueRef.current = [...queueRef.current, { ttl, resolve }];
          return cleaned;
        });
      }),
    [cleanupExpired, releaseSlot],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => cleanupExpired(prev));
    }, AnimationConfig.staggerDelayMs);
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const value = useMemo(
    () => ({
      requestSlot,
      releaseSlot,
      activeCount: active.length,
      activeSlots: active.map((slot) => slot.id),
    }),
    [active, releaseSlot, requestSlot],
  );

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};

export const useAnimationPool = () => {
  const ctx = useContext(AnimationContext);
  if (!ctx) {
    throw new Error('useAnimationPool must be used within an AnimationProvider');
  }
  return ctx;
};
