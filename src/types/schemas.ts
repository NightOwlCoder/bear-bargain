/**
 * 🐻 BearBargain Zod Schemas
 * ALL validation schemas - copy from docs/Schemas.md
 */
import { z } from 'zod';

// ================================
// PRICE & ETF SCHEMAS
// ================================

export const PriceUpdateSchema = z.object({
  symbol: z.enum(['bitcoin', 'ethereum']),
  price: z.number().positive(),
  change24h: z.number(),
  timestamp: z.number(),
  volume: z.number().optional(),
});

export type PriceUpdate = z.infer<typeof PriceUpdateSchema>;

export const ETFPriceSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  price: z.number().positive(),
  change24h: z.number(),
  high24h: z.number().positive(),
  timestamp: z.number(),
});

export type ETFPrice = z.infer<typeof ETFPriceSchema>;

export const DipAlertSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  dipPercentage: z.number().min(5).max(50),
  price: z.number().positive(),
  highPrice: z.number().positive(),
  timestamp: z.number(),
  alertId: z.string().uuid(),
});

export type DipAlert = z.infer<typeof DipAlertSchema>;

// ================================
// AI CHAT SCHEMAS
// ================================

export const TradeWhispererResponseSchema = z.object({
  chunks: z.array(z.string()).min(2).max(12),
  action: z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(1),
  deepLink: z.string().optional(),
  memeLevel: z.enum(['BASIC', 'DEGEN', 'GOD_TIER']).optional(),
  bearRoar: z.boolean().optional(),
});

export type TradeWhispererResponse = z.infer<typeof TradeWhispererResponseSchema>;

export const UserMessageSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  timestamp: z.number(),
  isUser: z.literal(true),
  voiceDuration: z.number().optional(),
});

export type UserMessage = z.infer<typeof UserMessageSchema>;

export const AssistantMessageSchema = z.object({
  id: z.string().uuid(),
  chunks: z.array(z.string()),
  timestamp: z.number(),
  isUser: z.literal(false),
  action: z.enum(['buy', 'sell', 'hold']).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

// ================================
// PORTFOLIO SCHEMAS
// ================================

export const TradeSimulationSchema = z.object({
  id: z.string().uuid(),
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  action: z.enum(['buy', 'sell']),
  amount: z.number().positive(),
  price: z.number().positive(),
  shares: z.number().positive(),
  timestamp: z.number(),
  projectedValue: z.number().positive().optional(),
  projectedGainPercent: z.number().optional(),
});

export type TradeSimulation = z.infer<typeof TradeSimulationSchema>;

export const PortfolioHoldingSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  shares: z.number().positive(),
  avgPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  unrealizedPnl: z.number(),
  timestamp: z.number(),
});

export type PortfolioHolding = z.infer<typeof PortfolioHoldingSchema>;

export const PortfolioSchema = z.object({
  holdings: z.array(PortfolioHoldingSchema),
  totalValue: z.number(),
  totalPnl: z.number(),
  lastUpdated: z.number(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

// ================================
// OFFLINE QUEUE SCHEMA
// ================================

export const QueuedActionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['dca_buy', 'take_profit', 'rebalance']),
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  amount: z.number().positive(),
  originalPrice: z.number().positive(),
  queuedAt: z.number(),
  status: z.enum(['queued', 'fresh', 'stale', 'expired', 'executed']),
  currentPrice: z.number().positive().optional(),
  priceDelta: z.number().optional(),
});

export type QueuedAction = z.infer<typeof QueuedActionSchema>;

export const QueueResolutionSchema = z.object({
  action: QueuedActionSchema,
  resolution: z.enum(['execute', 'prompt', 'expire']),
  message: z.string().optional(),
});

export type QueueResolution = z.infer<typeof QueueResolutionSchema>;

// ================================
// SETTINGS SCHEMAS
// ================================

export const UserSettingsSchema = z.object({
  dipThreshold: z.number().min(5).max(50).default(10),
  portfolioSplit: z.object({
    IBIT: z.number().min(0).max(100).default(70),
    ETHA: z.number().min(0).max(100).default(20),
    STCE: z.number().min(0).max(100).default(10),
  }),
  notificationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  darkMode: z.enum(['auto', 'dark', 'light']).default('auto'),
  voiceEnabled: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// ================================
// ETF SYMBOL TYPE
// ================================

export type ETFSymbol = 'IBIT' | 'ETHA' | 'STCE';

export const ETF_SYMBOLS: ETFSymbol[] = ['IBIT', 'ETHA', 'STCE'];

// ETF to Crypto mapping
export const ETF_TO_CRYPTO: Record<ETFSymbol, 'bitcoin' | 'ethereum'> = {
  IBIT: 'bitcoin',
  ETHA: 'ethereum',
  STCE: 'ethereum', // Staked ETH
};
