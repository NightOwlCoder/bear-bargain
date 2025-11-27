# 📋 BearBargain Zod Schemas

**Version 1.0** - ALL validation schemas. Import from `src/types/schemas.ts`.

---

## 🪙 Price & ETF Schemas

```typescript
// src/types/schemas.ts
import { z } from 'zod';

// COINGECKO WEBSOCKET MESSAGES
export const PriceUpdateSchema = z.object({
  symbol: z.enum(['bitcoin', 'ethereum']),
  price: z.number().positive(),
  change24h: z.number(),
  timestamp: z.number(),
  volume: z.number().optional(),
});

export type PriceUpdate = z.infer<typeof PriceUpdateSchema>;

// ETF MAPPING (IBIT=bitcoin, ETHA=ethereum)
export const ETFPriceSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  price: z.number().positive(),
  change24h: z.number(),
  high24h: z.number().positive(),
  timestamp: z.number(),
});

export type ETFPrice = z.infer<typeof ETFPriceSchema>;

// DIP ALERTS
export const DipAlertSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  dipPercentage: z.number().min(5).max(50),
  price: z.number().positive(),
  highPrice: z.number().positive(),
  timestamp: z.number(),
  alertId: z.string().uuid(),
});

export type DipAlert = z.infer<typeof DipAlertSchema>;
```

---

## 💬 AI Chat Schemas

```typescript
// TRADE WHISPERER RESPONSES (2-12 chunk JSON)
export const TradeWhispererResponseSchema = z.object({
  chunks: z.array(z.string()).min(2).max(12),
  action: z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(1),
  deepLink: z.string().optional(),
  memeLevel: z.enum(['BASIC', 'DEGEN', 'GOD_TIER']).optional(),
  bearRoar: z.boolean().optional(),
});

export type TradeWhispererResponse = z.infer<typeof TradeWhispererResponseSchema>;

// USER MESSAGES
export const UserMessageSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  timestamp: z.number(),
  isUser: z.literal(true),
  voiceDuration: z.number().optional(), // STT seconds
});

export type UserMessage = z.infer<typeof UserMessageSchema>;

// ASSISTANT MESSAGES
export const AssistantMessageSchema = z.object({
  id: z.string().uuid(),
  chunks: z.array(z.string()),
  timestamp: z.number(),
  isUser: z.literal(false),
  action: z.enum(['buy', 'sell', 'hold']).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;
```

---

## 💼 Portfolio Schemas

```typescript
// SIMULATED TRADES
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

// PORTFOLIO HOLDINGS
export const PortfolioHoldingSchema = z.object({
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  shares: z.number().positive(),
  avgPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  unrealizedPnl: z.number(),
  timestamp: z.number(),
});

export type PortfolioHolding = z.infer<typeof PortfolioHoldingSchema>;

// FULL PORTFOLIO
export const PortfolioSchema = z.object({
  holdings: z.array(PortfolioHoldingSchema),
  totalValue: z.number(),
  totalPnl: z.number(),
  lastUpdated: z.number(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;
```

---

## 🔄 Offline Queue Schema

```typescript
// QUEUED ACTIONS
export const QueuedActionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['dca_buy', 'take_profit', 'rebalance']),
  symbol: z.enum(['IBIT', 'ETHA', 'STCE']),
  amount: z.number().positive(),
  originalPrice: z.number().positive(),
  queuedAt: z.number(),
  status: z.enum(['queued', 'fresh', 'stale', 'expired', 'executed']),
  currentPrice: z.number().positive().optional(), // On reconnect
  priceDelta: z.number().optional(), // % change since queued
});

export type QueuedAction = z.infer<typeof QueuedActionSchema>;

// QUEUE RESOLUTION RESULT
export const QueueResolutionSchema = z.object({
  action: QueuedActionSchema,
  resolution: z.enum(['execute', 'prompt', 'expire']),
  message: z.string().optional(),
});

export type QueueResolution = z.infer<typeof QueueResolutionSchema>;
```

---

## ⚙️ Settings Schemas

```typescript
// USER SETTINGS
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
```

---

## 🧪 Usage Examples

```typescript
// VALIDATE WEBSOCKET MESSAGE
const wsMessage = JSON.parse(event.data);
const validated = PriceUpdateSchema.safeParse(wsMessage);
if (!validated.success) {
  console.error('Invalid WS:', validated.error.format());
  return; // Don't process invalid data
}
const price = validated.data; // Type-safe!

// VALIDATE AI RESPONSE
try {
  const aiResponse = await grokApi.query(userMessage);
  const whisperer = TradeWhispererResponseSchema.parse(aiResponse);
  // Use whisperer.chunks for stagger animation
} catch (error) {
  if (error instanceof z.ZodError) {
    // Fallback to local meme response
    return FALLBACK_MEME_RESPONSE;
  }
  throw error;
}

// VALIDATE DIP ALERT BEFORE DISPLAYING
const alert = DipAlertSchema.safeParse(dipData);
if (alert.success) {
  triggerClawAnimation(alert.data);
} else {
  console.error('Invalid dip alert:', alert.error);
}

// VALIDATE TRADE BEFORE SAVING TO SQLite
const trade = TradeSimulationSchema.parse({
  id: uuid(),
  symbol: 'IBIT',
  action: 'buy',
  amount: 100,
  price: 85.50,
  shares: 1.17,
  timestamp: Date.now(),
});
await portfolioStore.addTrade(trade);
```

---

## 📏 Validation Rules

| Schema | Required Fields | Constraints |
|--------|-----------------|-------------|
| `PriceUpdateSchema` | symbol, price, timestamp | price > 0 |
| `ETFPriceSchema` | symbol, price, change24h | symbol ∈ {IBIT, ETHA, STCE} |
| `DipAlertSchema` | all fields | 5% ≤ dip ≤ 50% |
| `TradeWhispererResponseSchema` | chunks, action, confidence | 2 ≤ chunks.length ≤ 12 |
| `TradeSimulationSchema` | id, symbol, action, amount, price, shares | amount > 0, price > 0 |
| `QueuedActionSchema` | all except optional | status ∈ valid states |

---

## 🛡️ Best Practices

1. **ALWAYS** validate external data (WebSocket, API responses)
2. **NEVER** trust unparsed data in UI components
3. **USE** `safeParse()` for non-critical validation (show fallback UI)
4. **USE** `parse()` for critical validation (throw on invalid)
5. **PERSIST** only validated schemas to SQLite
6. **LOG** validation errors to Sentry for debugging
