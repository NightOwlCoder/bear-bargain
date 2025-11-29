import { calcDip, createHysteresisTracker, mapCryptoPriceToEtf } from '../src/hooks/useDipDetector';
import { DipAlertSchema, PriceUpdateSchema } from '../src/types/schemas';

describe('useDipDetector', () => {
  test('calculates 10% dip correctly', () => {
    expect(calcDip(90, 100)).toBe(10);
    expect(calcDip(85, 100)).toBe(15);
  });

  test('Zod validates CoinGecko response', () => {
    const valid = {
      symbol: 'bitcoin',
      price: 91295,
      change24h: -2.3,
      timestamp: Date.now(),
    };
    expect(() => PriceUpdateSchema.parse(valid)).not.toThrow();
  });

  test('maps crypto updates to ETF prices', () => {
    const now = Date.now();
    const btc = mapCryptoPriceToEtf({ symbol: 'bitcoin', price: 100000, change24h: -1, timestamp: now });
    const eth = mapCryptoPriceToEtf({ symbol: 'ethereum', price: 3000, change24h: 2.5, timestamp: now });
    expect(btc[0]).toMatchObject({ symbol: 'IBIT', price: 100 });
    expect(eth).toHaveLength(2);
    expect(eth[0]).toMatchObject({ symbol: 'ETHA', price: 30 });
  });

  test('hysteresis prevents spam alerts', () => {
    const tracker = createHysteresisTracker(10, 2);
    expect(tracker(9.5)).toBe(false); // under threshold
    expect(tracker(10.2)).toBe(true); // initial alert
    expect(tracker(9.8)).toBe(false); // within hysteresis window, no re-fire
    expect(tracker(7.5)).toBe(false); // recovery region resets state
    expect(tracker(10.5)).toBe(true); // new alert after recovery
  });

  test('DipAlertSchema validates alert objects', () => {
    const validAlert = {
      symbol: 'IBIT',
      dipPercentage: 12.5,
      price: 85.23,
      highPrice: 97.5,
      timestamp: Date.now(),
      alertId: crypto.randomUUID(),
    };
    expect(() => DipAlertSchema.parse(validAlert)).not.toThrow();
  });
});
