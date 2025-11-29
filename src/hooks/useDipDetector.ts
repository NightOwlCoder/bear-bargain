import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DipConfig, FeatureFlags } from '../utils/featureFlags';
import {
  DipAlert,
  DipAlertSchema,
  ETFPrice,
  ETFPriceSchema,
  ETFSymbol,
  ETF_TO_CRYPTO,
  PriceUpdateSchema,
} from '../types/schemas';

const HYSTERESIS = 0.02; // 2%
const ETF_RATIOS: Record<'bitcoin' | 'ethereum', number> = {
  bitcoin: 0.001,
  ethereum: 0.01,
};

type DipDetectorStatus = 'idle' | 'connecting' | 'listening' | 'alert_firing' | 'cooldown' | 'error';

type PriceState = Record<ETFSymbol, ETFPrice | null>;

type DipDetectorResult = {
  status: DipDetectorStatus;
  prices: PriceState;
  activeAlert: DipAlert | null;
  queuedAlerts: DipAlert[];
  threshold: number;
  dismissAlert: () => void;
  triggerManualDip: (symbol: ETFSymbol, dropPercent?: number) => void;
};

const initialPriceState: PriceState = {
  IBIT: null,
  ETHA: null,
  STCE: null,
};

const createUuid = () => `alert-${Math.random().toString(16).slice(2)}-${Date.now()}`;

const buildETFPrice = (symbol: ETFSymbol, price: number, change24h: number, high24h: number): ETFPrice =>
  ETFPriceSchema.parse({
    symbol,
    price,
    change24h,
    high24h,
    timestamp: Date.now(),
  });

const mapCryptoToEtfs = (cryptoSymbol: 'bitcoin' | 'ethereum'): ETFSymbol[] => {
  return (Object.keys(ETF_TO_CRYPTO) as ETFSymbol[]).filter(
    (etf) => ETF_TO_CRYPTO[etf] === cryptoSymbol,
  );
};

const calculateETFPrice = (cryptoSymbol: 'bitcoin' | 'ethereum', price: number): number => {
  const ratio = ETF_RATIOS[cryptoSymbol];
  return price * ratio;
};

const useDipDetector = (): DipDetectorResult => {
  const threshold = DipConfig.defaultThreshold;
  const [status, setStatus] = useState<DipDetectorStatus>('idle');
  const [prices, setPrices] = useState<PriceState>(initialPriceState);
  const [activeAlert, setActiveAlert] = useState<DipAlert | null>(null);
  const [queuedAlerts, setQueuedAlerts] = useState<DipAlert[]>([]);

  const sessionHighRef = useRef<Record<ETFSymbol, number>>({ IBIT: 0, ETHA: 0, STCE: 0 });
  const lastAlertPriceRef = useRef<Record<ETFSymbol, number | null>>({
    IBIT: null,
    ETHA: null,
    STCE: null,
  });
  const wsRef = useRef<WebSocket | null>(null);
  const lastTickRef = useRef<Record<'bitcoin' | 'ethereum', number>>({ bitcoin: 0, ethereum: 0 });

  const enqueueAlert = useCallback((alert: DipAlert) => {
    const parsed = DipAlertSchema.parse(alert);
    setQueuedAlerts((current) => {
      const next = [...current, parsed];
      if (next.length > DipConfig.maxQueuedActions) {
        return next.slice(next.length - DipConfig.maxQueuedActions);
      }
      return next;
    });
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
    setStatus('cooldown');
    setTimeout(() => setStatus('listening'), DipConfig.wsThrottleMs);
  }, []);

  const handleDipDetected = useCallback(
    (symbol: ETFSymbol, price: number, highPrice: number, dropPercent: number) => {
      const alert: DipAlert = DipAlertSchema.parse({
        symbol,
        dipPercentage: Number(dropPercent.toFixed(1)),
        price,
        highPrice,
        timestamp: Date.now(),
        alertId: createUuid(),
      });

      console.log(`🐻 DIP DETECTED! ${symbol} -${alert.dipPercentage}%`);
      setActiveAlert(alert);
      lastAlertPriceRef.current[symbol] = price;
      setStatus('alert_firing');
    },
    [],
  );

  const evaluateDip = useCallback(
    (symbol: ETFSymbol, currentPrice: number) => {
      const sessionHigh = sessionHighRef.current[symbol] || currentPrice;
      const dropPercent = ((sessionHigh - currentPrice) / sessionHigh) * 100;
      const lastAlertPrice = lastAlertPriceRef.current[symbol];
      const withinHysteresis =
        lastAlertPrice !== null && currentPrice > lastAlertPrice * (1 - HYSTERESIS);

      if (dropPercent >= threshold && !withinHysteresis) {
        handleDipDetected(symbol, currentPrice, sessionHigh, dropPercent);
      }
    },
    [handleDipDetected, threshold],
  );

  const updatePriceState = useCallback(
    (etf: ETFSymbol, price: number, change24h: number) => {
      sessionHighRef.current[etf] = Math.max(sessionHighRef.current[etf], price);
      const high24h = sessionHighRef.current[etf] || price;

      const parsed = buildETFPrice(etf, price, change24h, high24h);
      setPrices((current) => ({ ...current, [etf]: parsed }));
      evaluateDip(etf, price);
    },
    [evaluateDip],
  );

  const handlePriceUpdate = useCallback(
    (raw: unknown) => {
      const parsed = PriceUpdateSchema.safeParse(raw);
      if (!parsed.success) return;
      const update = parsed.data;

      const now = Date.now();
      const lastTick = lastTickRef.current[update.symbol];
      if (now - lastTick < DipConfig.wsThrottleMs) {
        return;
      }
      lastTickRef.current[update.symbol] = now;

      const etfSymbols = mapCryptoToEtfs(update.symbol);
      const etfPrice = calculateETFPrice(update.symbol, update.price);

      etfSymbols.forEach((etfSymbol) => {
        updatePriceState(etfSymbol, etfPrice, update.change24h);
      });
    },
    [updatePriceState],
  );

  const fetchInitialPrices = useCallback(async () => {
    try {
      const url = new URL('https://api.coingecko.com/api/v3/simple/price');
      url.searchParams.set('ids', 'bitcoin,ethereum');
      url.searchParams.set('vs_currencies', 'usd');
      url.searchParams.set('include_24hr_change', 'true');
      url.searchParams.set('include_24hr_vol', 'true');
      if (process.env.COINGECKO_API_KEY) {
        url.searchParams.set('x_cg_demo_api_key', process.env.COINGECKO_API_KEY);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      (['bitcoin', 'ethereum'] as const).forEach((asset) => {
        if (data?.[asset]?.usd) {
          const update = {
            symbol: asset,
            price: data[asset].usd,
            change24h: data[asset].usd_24h_change ?? 0,
            volume: data[asset].usd_24h_vol,
            timestamp: Date.now(),
          };
          handlePriceUpdate(update);
        }
      });

      console.log('✅ Live prices loaded');
    } catch (error) {
      console.error('Failed to load initial prices', error);
    }
  }, [handlePriceUpdate]);

  const startWebSocket = useCallback(() => {
    setStatus('connecting');
    try {
      const socket = new WebSocket('wss://stream.coingecko.com/prices');
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('✅ CoinGecko API connected');
        setStatus('listening');
        fetchInitialPrices();
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handlePriceUpdate(payload);
        } catch (error) {
          console.error('Failed to parse WS message', error);
        }
      };

      socket.onerror = () => {
        setStatus('error');
      };

      socket.onclose = () => {
        setStatus('error');
        setTimeout(startWebSocket, 1500);
      };
    } catch (error) {
      console.error('WebSocket initialization failed', error);
      setStatus('error');
    }
  }, [fetchInitialPrices, handlePriceUpdate]);

  useEffect(() => {
    if (FeatureFlags.useMockPrices) {
      setStatus('listening');
      const basePrice = { bitcoin: 92000, ethereum: 3500 } as const;
      const interval = setInterval(() => {
        (['bitcoin', 'ethereum'] as const).forEach((asset) => {
          const drift = (Math.random() - 0.5) * 500;
          const update = {
            symbol: asset,
            price: basePrice[asset] + drift,
            change24h: Math.random() * 6 - 3,
            timestamp: Date.now(),
            volume: Math.random() * 1_000_000,
          };
          handlePriceUpdate(update);
        });
      }, DipConfig.wsThrottleMs);

      return () => clearInterval(interval);
    }

    startWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [handlePriceUpdate, startWebSocket]);

  useEffect(() => {
    if (status === 'listening' && !activeAlert && queuedAlerts.length > 0) {
      const [nextAlert, ...rest] = queuedAlerts;
      setQueuedAlerts(rest);
      setActiveAlert(nextAlert);
      setStatus('alert_firing');
    }
  }, [activeAlert, queuedAlerts, status]);

  const triggerManualDip = useCallback(
    (symbol: ETFSymbol, dropPercent = threshold + 2) => {
      const current = prices[symbol];
      if (!current) return;
      const simulatedPrice = current.price * (1 - dropPercent / 100);
      const sessionHigh = sessionHighRef.current[symbol] || current.price;
      if (status !== 'listening') {
        enqueueAlert(
          DipAlertSchema.parse({
            symbol,
            dipPercentage: dropPercent,
            price: simulatedPrice,
            highPrice: sessionHigh,
            timestamp: Date.now(),
            alertId: createUuid(),
          }),
        );
        return;
      }
      handleDipDetected(symbol, simulatedPrice, sessionHigh, dropPercent);
    },
    [enqueueAlert, handleDipDetected, prices, status, threshold],
  );

  const value: DipDetectorResult = useMemo(
    () => ({
      status,
      prices,
      activeAlert,
      queuedAlerts,
      threshold,
      dismissAlert,
      triggerManualDip,
    }),
    [activeAlert, dismissAlert, prices, queuedAlerts, status, threshold, triggerManualDip],
  );

  useEffect(() => {
    if (__DEV__) {
      console.log(`✅ Dip detector: ACTIVE (${threshold}% threshold)`);
    }
  }, [threshold]);

  return value;
};

export default useDipDetector;
