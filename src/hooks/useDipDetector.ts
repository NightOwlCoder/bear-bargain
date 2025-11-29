import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DipAlert,
  DipAlertSchema,
  ETFPrice,
  ETFPriceSchema,
  ETFSymbol,
  PriceUpdateSchema,
  QueuedAction,
  QueuedActionSchema,
} from '../types/schemas';
import { AnimationConfig, DipConfig, FeatureFlags } from '../utils/featureFlags';

const HYSTERESIS_BUFFER = 0.02; // 2% hysteresis
const CRYPTO_RATIOS: Record<'bitcoin' | 'ethereum', number> = {
  bitcoin: 0.001, // IBIT ratio
  ethereum: 0.01, // ETHA/STCE ratio
};

const createId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `dip-${Math.random().toString(36).slice(2, 10)}`);

const mapToEtfSymbol = (crypto: 'bitcoin' | 'ethereum'): ETFSymbol[] =>
  crypto === 'bitcoin' ? ['IBIT'] : ['ETHA', 'STCE'];

const calculateEtfPrice = (crypto: 'bitcoin' | 'ethereum', price: number) =>
  price * CRYPTO_RATIOS[crypto];

interface DipDetectorResult {
  status: 'idle' | 'connecting' | 'listening' | 'alert_firing' | 'cooldown' | 'error';
  prices: Partial<Record<ETFSymbol, ETFPrice>>;
  activeAlert: DipAlert | null;
  queuedActions: QueuedAction[];
  reconnect: () => void;
  dismissAlert: () => void;
  lastError?: string;
}

const parseRestResponse = async () => {
  const params = new URLSearchParams({
    ids: 'bitcoin,ethereum',
    vs_currencies: 'usd',
    include_24hr_change: 'true',
    include_24hr_vol: 'true',
  });

  if (process.env.COINGECKO_API_KEY) {
    params.append('x_cg_demo_api_key', process.env.COINGECKO_API_KEY);
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;
  const response = await fetch(url);
  const json = await response.json();
  return json as Record<string, { usd: number; usd_24h_change: number; usd_24h_vol?: number }>;
};

export const useDipDetector = (threshold: number = DipConfig.defaultThreshold): DipDetectorResult => {
  const [status, setStatus] = useState<DipDetectorResult['status']>('idle');
  const [prices, setPrices] = useState<Partial<Record<ETFSymbol, ETFPrice>>>({});
  const [activeAlert, setActiveAlert] = useState<DipAlert | null>(null);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [lastError, setLastError] = useState<string | undefined>();

  const pricesRef = useRef<Partial<Record<ETFSymbol, ETFPrice>>>({});
  const sessionHighsRef = useRef<Record<ETFSymbol, number>>({ IBIT: 0, ETHA: 0, STCE: 0 });
  const lastAlertPriceRef = useRef<Record<ETFSymbol, number | null>>({ IBIT: null, ETHA: null, STCE: null });
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offlineQueueRef = useRef<DipAlert[]>([]);
  const lastTickRef = useRef<number>(0);

  const updatePrices = (next: Partial<Record<ETFSymbol, ETFPrice>>) => {
    pricesRef.current = { ...pricesRef.current, ...next };
    setPrices((prev) => ({ ...prev, ...next }));
  };

  const queueDipForReconnect = (alert: DipAlert) => {
    const queuedCandidate: QueuedAction = {
      id: alert.alertId,
      type: 'dca_buy',
      symbol: alert.symbol,
      amount: alert.price,
      originalPrice: alert.highPrice,
      queuedAt: alert.timestamp,
      status: 'queued',
      currentPrice: alert.price,
      priceDelta: (alert.highPrice - alert.price) / alert.highPrice,
    } as QueuedAction;

    const validated = QueuedActionSchema.safeParse(queuedCandidate);
    if (!validated.success) {
      console.warn('Failed to queue dip alert', validated.error);
      return;
    }

    setQueuedActions((prev) => {
      const merged = [...prev, validated.data];
      const trimmed = merged.slice(-DipConfig.maxQueuedActions);
      offlineQueueRef.current = [...offlineQueueRef.current, alert].slice(-DipConfig.maxQueuedActions);
      return trimmed;
    });
  };

  const fireAlert = (alert: DipAlert) => {
    setActiveAlert(alert);
    lastAlertPriceRef.current[alert.symbol] = alert.price;
    console.log('🐻 DIP DETECTED! SNIPE NOW!', alert);
    setStatus('alert_firing');
    setTimeout(() => {
      setStatus('cooldown');
      setActiveAlert(null);
      setTimeout(() => setStatus('listening'), 250);
    }, AnimationConfig.alertTtlMs);
  };

  const evaluateDip = (symbol: ETFSymbol, price: number, timestamp: number) => {
    const currentHigh = sessionHighsRef.current[symbol] || price;
    const updatedHigh = price > currentHigh ? price : currentHigh;
    sessionHighsRef.current[symbol] = updatedHigh;

    const dropPercent = ((updatedHigh - price) / updatedHigh) * 100;
    if (dropPercent < threshold) {
      return;
    }

    const lastAlertPrice = lastAlertPriceRef.current[symbol];
    if (lastAlertPrice && price > lastAlertPrice * (1 - HYSTERESIS_BUFFER)) {
      return;
    }

    const alertCandidate: DipAlert = {
      symbol,
      dipPercentage: Number(dropPercent.toFixed(1)),
      price,
      highPrice: updatedHigh,
      timestamp,
      alertId: createId(),
    };

    const parsed = DipAlertSchema.safeParse(alertCandidate);
    if (!parsed.success) {
      console.warn('Dip alert failed validation', parsed.error);
      return;
    }

    if (status === 'error') {
      queueDipForReconnect(parsed.data);
    } else {
      fireAlert(parsed.data);
    }
  };

  const processPriceUpdate = (crypto: 'bitcoin' | 'ethereum', price: number, change24h: number) => {
    const etfPrice = calculateEtfPrice(crypto, price);
    const timestamp = Date.now();
    const targets = mapToEtfSymbol(crypto);

    targets.forEach((symbol) => {
      const etfCandidate: ETFPrice = {
        symbol,
        price: Number(etfPrice.toFixed(2)),
        change24h,
        high24h: Math.max(sessionHighsRef.current[symbol] || etfPrice, etfPrice),
        timestamp,
      } as ETFPrice;

      const validated = ETFPriceSchema.safeParse(etfCandidate);
      if (validated.success) {
        updatePrices({ [symbol]: validated.data });
        evaluateDip(symbol, validated.data.price, timestamp);
      } else {
        console.warn('ETF price validation failed', validated.error);
      }
    });
  };

  const handleWsMessage = (event: any) => {
    const now = Date.now();
    if (now - lastTickRef.current < DipConfig.wsThrottleMs) {
      return;
    }
    lastTickRef.current = now;

    try {
      const parsed = JSON.parse((event as any).data ?? '{}');
      const payloads: { crypto: 'bitcoin' | 'ethereum'; price: number; change24h: number }[] = [];
      (['bitcoin', 'ethereum'] as const).forEach((symbol) => {
        if (parsed?.[symbol]?.usd) {
          payloads.push({ crypto: symbol, price: parsed[symbol].usd, change24h: parsed[symbol].usd_24h_change ?? 0 });
        }
      });

      if (payloads.length === 0 && parsed?.symbol && parsed?.price) {
        const messageCandidate = PriceUpdateSchema.safeParse({
          symbol: parsed.symbol,
          price: parsed.price,
          change24h: parsed.change24h ?? 0,
          timestamp: parsed.timestamp ?? Date.now(),
          volume: parsed.volume,
        });
        if (messageCandidate.success) {
          payloads.push({
            crypto: messageCandidate.data.symbol,
            price: messageCandidate.data.price,
            change24h: messageCandidate.data.change24h,
          });
        }
      }

      payloads.forEach(({ crypto, price, change24h }) => processPriceUpdate(crypto, price, change24h));
    } catch (error) {
      console.warn('Failed to parse websocket payload', error);
    }
  };

  const initWebSocket = async () => {
    setStatus('connecting');
    setLastError(undefined);

    try {
      const initial = await parseRestResponse();
      (['bitcoin', 'ethereum'] as const).forEach((symbol) => {
        const candidate = initial?.[symbol];
        if (!candidate) return;
        const priceUpdate = PriceUpdateSchema.safeParse({
          symbol,
          price: candidate.usd,
          change24h: candidate.usd_24h_change ?? 0,
          timestamp: Date.now(),
          volume: candidate.usd_24h_vol,
        });
        if (priceUpdate.success) {
          processPriceUpdate(symbol, priceUpdate.data.price, priceUpdate.data.change24h);
        }
      });

      console.log(
        `✅ Live prices loaded: IBIT=$${calculateEtfPrice('bitcoin', initial?.bitcoin?.usd ?? 0).toFixed(2)}, ETHA=$${calculateEtfPrice('ethereum', initial?.ethereum?.usd ?? 0).toFixed(2)}, STCE=$${calculateEtfPrice('ethereum', initial?.ethereum?.usd ?? 0).toFixed(2)}`,
      );
    } catch (error) {
      setLastError('Initial price fetch failed');
      setStatus('error');
      console.warn('Initial price fetch failed', error);
    }

    if (FeatureFlags.useMockPrices) {
      console.log('✅ CoinGecko API connected (mock)');
      console.log(`✅ Dip detector: ACTIVE (${threshold}% threshold)`);
      setStatus('listening');
      intervalRef.current = setInterval(() => {
        const baseBtc = pricesRef.current.IBIT?.price
          ? pricesRef.current.IBIT.price / CRYPTO_RATIOS.bitcoin
          : 90000;
        const baseEth = pricesRef.current.ETHA?.price
          ? pricesRef.current.ETHA.price / CRYPTO_RATIOS.ethereum
          : 3500;
        const drift = () => 1 + (Math.random() - 0.5) * 0.01;
        processPriceUpdate('bitcoin', baseBtc * drift(), (Math.random() - 0.5) * 5);
        processPriceUpdate('ethereum', baseEth * drift(), (Math.random() - 0.5) * 5);
      }, DipConfig.wsThrottleMs);
      return;
    }

    try {
      const ws = new WebSocket('wss://stream.coingecko.com/prices');
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('✅ CoinGecko API connected');
        console.log(`✅ Dip detector: ACTIVE (${threshold}% threshold)`);
        setStatus('listening');
      };
      ws.onmessage = handleWsMessage;
      ws.onerror = (event) => {
        console.warn('WebSocket error', event);
        setStatus('error');
        setLastError('WebSocket error');
      };
      ws.onclose = () => {
        setStatus('error');
        setLastError('WebSocket closed');
      };
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to polling', error);
      setStatus('error');
      setLastError('WebSocket connection failed');
    }
  };

  const dismissAlert = () => {
    setActiveAlert(null);
    setStatus('cooldown');
    setTimeout(() => setStatus('listening'), 250);
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    initWebSocket();
  };

  useEffect(() => {
    initWebSocket();
    return () => {
      wsRef.current?.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'listening' && offlineQueueRef.current.length) {
      const queued = [...offlineQueueRef.current];
      offlineQueueRef.current = [];
      setQueuedActions([]);
      queued.forEach((alert) => fireAlert(alert));
    }
  }, [status]);

  const memoized = useMemo(
    () => ({ status, prices, activeAlert, queuedActions, reconnect, dismissAlert, lastError }),
    [status, prices, activeAlert, queuedActions, lastError],
  );

  return memoized;
};
