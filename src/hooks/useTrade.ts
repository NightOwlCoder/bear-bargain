import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETFSymbol, TradeSimulation, TradeSimulationSchema } from '../types/schemas';

const TRADE_STORAGE_KEY = '@bearbargain/trades';

const generateUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });

export type ExecuteTradeParams = {
  symbol: ETFSymbol;
  amount: number;
  price: number;
};

export function useTrade() {
  const [trades, setTrades] = useState<TradeSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
      if (stored) {
        const parsed: TradeSimulation[] = JSON.parse(stored);
        const validated = parsed.filter((trade) => {
          try {
            TradeSimulationSchema.parse(trade);
            return true;
          } catch {
            return false;
          }
        });
        setTrades(validated);
      }
    } catch (err) {
      setError('Unable to load previous trades');
      console.warn('Failed to hydrate trades', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const persistTrades = useCallback(async (nextTrades: TradeSimulation[]) => {
    try {
      await AsyncStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(nextTrades));
    } catch (err) {
      console.warn('Failed to persist trades', err);
    }
  }, []);

  const executeTrade = useCallback(
    async ({ symbol, amount, price }: ExecuteTradeParams) => {
      const shares = price > 0 ? amount / price : 0;
      const trade: TradeSimulation = {
        id: generateUuid(),
        symbol,
        action: 'buy',
        amount,
        price,
        shares,
        timestamp: Date.now(),
        projectedValue: amount * 1.08,
        projectedGainPercent: 8.0,
      };

      try {
        TradeSimulationSchema.parse(trade);
        const nextTrades = [trade, ...trades];
        setTrades(nextTrades);
        setError(null);
        await persistTrades(nextTrades);
      } catch (err) {
        setError('Unable to simulate trade');
        console.warn('Trade validation failed', err);
      }
    },
    [persistTrades, trades]
  );

  const clearTrades = useCallback(async () => {
    setTrades([]);
    await AsyncStorage.removeItem(TRADE_STORAGE_KEY);
  }, []);

  return {
    trades,
    isLoading,
    error,
    executeTrade,
    clearTrades,
  };
}
