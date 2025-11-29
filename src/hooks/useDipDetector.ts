import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import {
  DipAlertSchema,
  ETFPrice,
  ETFPriceSchema,
  ETFSymbol,
  PriceUpdate,
  PriceUpdateSchema,
  QueuedActionSchema,
} from '../types/schemas';
import { AnimationConfig, DipConfig } from '../utils/featureFlags';

export type DipDetectorState = 'idle' | 'listening' | 'alert_firing' | 'cooldown';

export const calcDip = (currentPrice: number, highPrice: number): number => {
  if (highPrice <= 0) return 0;
  return Number((((highPrice - currentPrice) / highPrice) * 100).toFixed(2));
};

export const createHysteresisTracker = (
  threshold: number = DipConfig.defaultThreshold,
  hysteresisWindow: number = 2,
) => {
  let recovered = true;
  return (dipPercentage: number): boolean => {
    if (dipPercentage <= threshold - hysteresisWindow) {
      recovered = true;
    }

    if (dipPercentage >= threshold && recovered) {
      recovered = false;
      return true;
    }

    return false;
  };
};

const OFFLINE_QUEUE_SCHEMA = z.array(QueuedActionSchema).max(DipConfig.maxQueuedActions);

const ETF_RATIOS: Record<'bitcoin' | 'ethereum', number> = {
  bitcoin: 0.001,
  ethereum: 0.01,
};

const createEmptyPrices = (): Record<ETFSymbol, ETFPrice> => ({
  IBIT: {
    symbol: 'IBIT',
    price: 0,
    change24h: 0,
    high24h: 0,
    timestamp: Date.now(),
  },
  ETHA: {
    symbol: 'ETHA',
    price: 0,
    change24h: 0,
    high24h: 0,
    timestamp: Date.now(),
  },
  STCE: {
    symbol: 'STCE',
    price: 0,
    change24h: 0,
    high24h: 0,
    timestamp: Date.now(),
  },
});

export const mapCryptoPriceToEtf = (update: PriceUpdate): ETFPrice[] => {
  const etfs: ETFPrice[] = [];
  if (update.symbol === 'bitcoin') {
    etfs.push({
      symbol: 'IBIT',
      price: update.price * ETF_RATIOS.bitcoin,
      change24h: update.change24h,
      high24h: update.price * ETF_RATIOS.bitcoin,
      timestamp: update.timestamp,
    });
  }

  if (update.symbol === 'ethereum') {
    etfs.push(
      {
        symbol: 'ETHA',
        price: update.price * ETF_RATIOS.ethereum,
        change24h: update.change24h,
        high24h: update.price * ETF_RATIOS.ethereum,
        timestamp: update.timestamp,
      },
      {
        symbol: 'STCE',
        price: update.price * ETF_RATIOS.ethereum,
        change24h: update.change24h,
        high24h: update.price * ETF_RATIOS.ethereum,
        timestamp: update.timestamp,
      },
    );
  }

  return etfs;
};

const createWsUrl = () =>
  'wss://stream.coingecko.com/price';

// REST API fallback for initial prices (WebSocket requires Pro subscription)
const fetchInitialPrices = async (): Promise<PriceUpdate[]> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY || '';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true${apiKey ? `&x_cg_demo_api_key=${apiKey}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    
    const data = await response.json();
    const updates: PriceUpdate[] = [];
    
    if (data.bitcoin) {
      updates.push({
        symbol: 'bitcoin',
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change || 0,
        timestamp: Date.now(),
      });
    }
    
    if (data.ethereum) {
      updates.push({
        symbol: 'ethereum',
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change || 0,
        timestamp: Date.now(),
      });
    }
    
    console.log('🐻 Fetched initial prices from CoinGecko REST API:', updates);
    return updates;
  } catch (error) {
    console.warn('Failed to fetch initial prices:', error);
    return [];
  }
};

type DipDetectorHook = {
  state: DipDetectorState;
  prices: Record<ETFSymbol, ETFPrice>;
  activeAlert: ReturnType<typeof DipAlertSchema.parse> | null;
  queuedActions: z.infer<typeof OFFLINE_QUEUE_SCHEMA>;
  triggerAlert: (override: Partial<ReturnType<typeof DipAlertSchema.parse>> & {
    symbol: ETFSymbol;
    price: number;
    dipPercentage: number;
    timestamp?: number;
  }) => void;
};

/* istanbul ignore next */
export const useDipDetector = (
  threshold: number = DipConfig.defaultThreshold,
  hysteresisWindow: number = 2,
): DipDetectorHook => {
  const [state, setState] = useState<DipDetectorState>('idle');
  const [prices, setPrices] = useState<Record<ETFSymbol, ETFPrice>>(createEmptyPrices);
  const [activeAlert, setActiveAlert] = useState<ReturnType<typeof DipAlertSchema.parse> | null>(
    null,
  );
  const [queuedActions, setQueuedActions] = useState<z.infer<typeof OFFLINE_QUEUE_SCHEMA>>([]);

  const lastHighRef = useRef<Record<ETFSymbol, number>>({ IBIT: 0, ETHA: 0, STCE: 0 });
  const lastDipRef = useRef<Record<ETFSymbol, number>>({ IBIT: 0, ETHA: 0, STCE: 0 });
  const trackersRef = useRef<Record<ETFSymbol, ReturnType<typeof createHysteresisTracker>>>(
    {
      IBIT: createHysteresisTracker(threshold, hysteresisWindow),
      ETHA: createHysteresisTracker(threshold, hysteresisWindow),
      STCE: createHysteresisTracker(threshold, hysteresisWindow),
    },
  );
  const wsRef = useRef<WebSocket | null>(null);
  const throttleRef = useRef<Record<PriceUpdate['symbol'], number>>({
    bitcoin: 0,
    ethereum: 0,
  });

  const resetStateMachine = useCallback(() => {
    setState('listening');
  }, []);

  const enterCooldown = useCallback(() => {
    setState('cooldown');
    setTimeout(resetStateMachine, DipConfig.wsThrottleMs);
  }, [resetStateMachine]);

  const processDipAlert = useCallback(
    (symbol: ETFSymbol, price: number, highPrice: number, dipPercentage: number) => {
      setState('alert_firing');
      const alert = DipAlertSchema.parse({
        symbol,
        dipPercentage,
        price,
        highPrice,
        timestamp: Date.now(),
        alertId: crypto.randomUUID(),
      });

      setActiveAlert(alert);
      console.log(`🐻 DIP DETECTED! SNIPE NOW!`, alert);

      setTimeout(() => {
        setActiveAlert(null);
        enterCooldown();
      }, AnimationConfig.alertTtlMs);
    },
    [enterCooldown],
  );

  const enqueueAction = useCallback(
    (action: z.infer<typeof QueuedActionSchema>) => {
      setQueuedActions((prev) => {
        const next = [...prev, action].slice(-DipConfig.maxQueuedActions);
        const parsed = OFFLINE_QUEUE_SCHEMA.safeParse(next);
        if (!parsed.success) return prev;
        return parsed.data;
      });
    },
    [],
  );

  const handlePriceUpdate = useCallback(
    (update: PriceUpdate) => {
      const lastUpdateAt = throttleRef.current[update.symbol] ?? 0;
      if (Date.now() - lastUpdateAt < DipConfig.wsThrottleMs) return;
      throttleRef.current[update.symbol] = Date.now();
      const etfPrices = mapCryptoPriceToEtf(update);
      if (!etfPrices.length) return;

      setState((prev) => (prev === 'idle' ? 'listening' : prev));

      setPrices((prev) => {
        const next = { ...prev };
        etfPrices.forEach((etf) => {
          const parsed = ETFPriceSchema.safeParse(etf);
          if (!parsed.success) return;
          const current = parsed.data;
          next[current.symbol] = current;

          const high = Math.max(lastHighRef.current[current.symbol], current.high24h, current.price);
          lastHighRef.current[current.symbol] = high;
          const dip = calcDip(current.price, high);
          lastDipRef.current[current.symbol] = dip;
          const shouldFire = trackersRef.current[current.symbol](dip);
          if (shouldFire) {
            processDipAlert(current.symbol, current.price, high, dip);
          }
        });
        return next;
      });
    },
    [processDipAlert],
  );

  const connectWs = useCallback(() => {
    // First, fetch initial prices via REST API (always works with free tier)
    fetchInitialPrices().then((updates) => {
      updates.forEach((update) => handlePriceUpdate(update));
    });

    // WebSocket requires Pro subscription - skip for free tier
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket unavailable; using REST API polling.');
      setState('listening');
      return;
    }

    // Try WebSocket but fallback gracefully
    try {
      const ws = new WebSocket(createWsUrl());
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('✅ WebSocket connected to CoinGecko');
        setState('listening');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const parsed = PriceUpdateSchema.safeParse(data);
          if (!parsed.success) return;
          handlePriceUpdate(parsed.data);
        } catch (err) {
          console.warn('Invalid WebSocket payload', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error (expected for free tier):', err);
        // Continue with REST API polling
        setState('listening');
      };

      ws.onclose = () => {
        console.log('WebSocket closed - using REST API fallback');
        setState('listening');
      };
    } catch (error) {
      console.warn('WebSocket setup failed, using REST API:', error);
      setState('listening');
    }

    // Set up REST API polling as fallback (every 30 seconds)
    const pollInterval = setInterval(() => {
      fetchInitialPrices().then((updates) => {
        updates.forEach((update) => handlePriceUpdate(update));
      });
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [handlePriceUpdate]);

  const triggerAlert: DipDetectorHook['triggerAlert'] = useCallback(
    ({ symbol, price, dipPercentage, timestamp, ...rest }) => {
      const highPrice = Math.max(price / (1 - dipPercentage / 100), price);
      const alert = DipAlertSchema.parse({
        symbol,
        price,
        dipPercentage,
        highPrice,
        timestamp: timestamp ?? Date.now(),
        alertId: crypto.randomUUID(),
        ...rest,
      });

      if (state === 'idle') {
        enqueueAction({
          id: crypto.randomUUID(),
          type: 'dca_buy',
          symbol,
          amount: alert.price,
          originalPrice: alert.highPrice,
          queuedAt: Date.now(),
          status: 'queued',
        });
        return;
      }

      setActiveAlert(alert);
      console.log('🐻 DIP DETECTED! SNIPE NOW!', alert);
      setState('alert_firing');
      setTimeout(() => {
        setActiveAlert(null);
        enterCooldown();
      }, AnimationConfig.alertTtlMs);
    },
    [enqueueAction, enterCooldown, state],
  );

  useEffect(() => {
    connectWs();
    return () => {
      wsRef.current?.close();
    };
  }, [connectWs]);

  useEffect(() => {
    if (!queuedActions.length || state !== 'listening') return;
    queuedActions.forEach((action) => {
      processDipAlert(action.symbol, action.amount, action.originalPrice, lastDipRef.current[action.symbol]);
    });
    setQueuedActions([]);
  }, [processDipAlert, queuedActions, state]);

  const value = useMemo(
    () => ({ state, prices, activeAlert, queuedActions, triggerAlert }),
    [activeAlert, prices, queuedActions, state, triggerAlert],
  );

  return value;
};

export default useDipDetector;
