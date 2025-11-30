import { useMemo } from 'react';
import { ETFSymbol } from '../types/schemas';

type MockHolding = {
  symbol: ETFSymbol;
  shares: number;
  avgPrice: number;
};

const MOCK_PORTFOLIO_VALUE = 90000;

const MOCK_HOLDINGS: Record<ETFSymbol, MockHolding> = {
  IBIT: { symbol: 'IBIT', shares: 220, avgPrice: 85.23 },
  ETHA: { symbol: 'ETHA', shares: 46, avgPrice: 3125.4 },
  STCE: { symbol: 'STCE', shares: 60, avgPrice: 2540.1 },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type PortfolioProjection = {
  recommendedAmount: number;
  recommendedShares: number;
  portfolioImpactPercent: number;
  newDollarCostAverage: number;
  totalValue: number;
  baseHolding: MockHolding;
};

export function usePortfolio(symbol: ETFSymbol, price: number, dipPercentage: number): PortfolioProjection {
  return useMemo(() => {
    const safePrice = price > 0 ? price : 1;
    const holding = MOCK_HOLDINGS[symbol];
    const dipBoost = clamp(dipPercentage / 100, 0.05, 0.2);
    const allocationPercent = clamp(0.05 + dipBoost * 0.4, 0.06, 0.15);
    const recommendedAmount = Math.max(safePrice, Math.round(MOCK_PORTFOLIO_VALUE * allocationPercent));
    const recommendedShares = recommendedAmount / safePrice;
    const newTotalShares = holding.shares + recommendedShares;
    const newDollarCostAverage =
      newTotalShares > 0
        ? (holding.avgPrice * holding.shares + recommendedAmount) / newTotalShares
        : holding.avgPrice;
    const portfolioImpactPercent = (recommendedAmount / MOCK_PORTFOLIO_VALUE) * 100;

    return {
      recommendedAmount,
      recommendedShares,
      portfolioImpactPercent,
      newDollarCostAverage,
      totalValue: MOCK_PORTFOLIO_VALUE,
      baseHolding: holding,
    };
  }, [dipPercentage, price, symbol]);
}
