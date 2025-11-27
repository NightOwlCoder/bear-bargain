# 🧪 BearBargain Testing Strategy

**Version 1.0** - Testing approach for hooks, flows, and animations.

---

## 📊 Testing Matrix

| Layer | Tool | Coverage Target | What We Test |
|-------|------|-----------------|--------------|
| **Unit (Hooks)** | Jest | >80% | Zod validation, state logic, thresholds |
| **E2E (Flows)** | Detox | Critical paths | Dip → Alert → Popup → Confirm |
| **Visual (Anims)** | Storybook | Key components | 60fps, spring curves, stagger timing |
| **Integration** | Jest + MSW | API mocks | WebSocket, Grok API responses |

---

## 🧪 Unit Testing (Hooks)

### Setup

```bash
npm test                    # Run all unit tests
npm test -- useDipDetector  # Run specific hook tests
npm test -- --coverage      # Generate coverage report
```

### Hook Test Examples

```typescript
// __tests__/hooks/useDipDetector.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDipDetector } from '../src/hooks/useDipDetector';
import { PriceUpdateSchema } from '../src/types/schemas';

describe('useDipDetector', () => {
  it('should validate price updates with Zod', () => {
    const validPrice = {
      symbol: 'bitcoin',
      price: 95000,
      change24h: -12.5,
      timestamp: Date.now(),
    };
    
    const result = PriceUpdateSchema.safeParse(validPrice);
    expect(result.success).toBe(true);
  });
  
  it('should detect dip when price drops below threshold', () => {
    const { result } = renderHook(() => useDipDetector({
      symbol: 'IBIT',
      threshold: 10,
    }));
    
    act(() => {
      result.current.processPrice({
        symbol: 'bitcoin',
        price: 85500,  // -10% from high
        change24h: -10,
        timestamp: Date.now(),
      });
    });
    
    expect(result.current.dipAlert).toBeDefined();
    expect(result.current.dipAlert?.dipPercentage).toBeGreaterThanOrEqual(10);
  });
  
  it('should reject invalid price data', () => {
    const invalidPrice = {
      symbol: 'dogecoin',  // Not in enum
      price: -100,         // Negative price
    };
    
    const result = PriceUpdateSchema.safeParse(invalidPrice);
    expect(result.success).toBe(false);
  });
});
```

```typescript
// __tests__/hooks/useTradeWhisperer.test.ts
import { TradeWhispererResponseSchema } from '../src/types/schemas';

describe('useTradeWhisperer', () => {
  it('should validate AI response with 2-12 chunks', () => {
    const validResponse = {
      chunks: ['DIP!', 'BTC bleeding...', 'Buy now!'],
      action: 'buy',
      confidence: 0.92,
    };
    
    const result = TradeWhispererResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });
  
  it('should reject response with <2 chunks', () => {
    const invalidResponse = {
      chunks: ['Single chunk'],
      action: 'buy',
      confidence: 0.5,
    };
    
    const result = TradeWhispererResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
  
  it('should reject response with >12 chunks', () => {
    const tooManyChunks = {
      chunks: Array(15).fill('chunk'),
      action: 'hold',
      confidence: 0.5,
    };
    
    const result = TradeWhispererResponseSchema.safeParse(tooManyChunks);
    expect(result.success).toBe(false);
  });
});
```

---

## 🎯 E2E Testing (Detox)

### Critical User Flows

| Flow | Steps | Success Criteria |
|------|-------|-----------------|
| **Dip Alert Flow** | Dashboard → Price drops → Alert appears → Tap → Popup | Popup shows within 500ms |
| **Trade Simulation** | Popup → Slider → Confirm → Confetti | Trade saved to SQLite |
| **Offline Queue** | Disconnect → Queue action → Reconnect → Prompt | Stale check triggers |
| **Chat Streaming** | Send message → Chunks stagger → Action parsed | All chunks render |

### Detox Test Example

```typescript
// e2e/dipAlertFlow.e2e.ts
describe('Dip Alert Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should show alert when price drops 10%+', async () => {
    // Trigger mock price drop
    await element(by.id('debug-trigger-dip')).tap();
    
    // Wait for alert animation
    await waitFor(element(by.id('dip-alert-banner')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Verify alert content
    await expect(element(by.text('🐻 DIP DETECTED!'))).toBeVisible();
  });
  
  it('should open trade popup on alert tap', async () => {
    await element(by.id('dip-alert-banner')).tap();
    
    await waitFor(element(by.id('trade-confirm-popup')))
      .toBeVisible()
      .withTimeout(500);
    
    // Verify popup has slider
    await expect(element(by.id('amount-slider'))).toBeVisible();
  });
  
  it('should complete trade simulation', async () => {
    // Adjust slider
    await element(by.id('amount-slider')).swipe('right', 'slow', 0.5);
    
    // Tap confirm
    await element(by.id('confirm-trade-btn')).tap();
    
    // Wait for confetti animation
    await waitFor(element(by.id('confetti-animation')))
      .toBeVisible()
      .withTimeout(1000);
    
    // Verify popup dismisses
    await waitFor(element(by.id('trade-confirm-popup')))
      .not.toBeVisible()
      .withTimeout(2000);
  });
});
```

### Running E2E Tests

```bash
# Build for E2E
detox build --configuration ios.sim.debug

# Run tests
npm run test:e2e

# Run specific test file
detox test --configuration ios.sim.debug e2e/dipAlertFlow.e2e.ts
```

---

## 🎨 Visual Testing (Storybook)

### Animation Performance Targets

| Animation | Duration | FPS Target | Max Concurrent |
|-----------|----------|------------|----------------|
| Claw Swipe | 300ms | 60fps | 2 |
| Stagger Fade | 32ms/word | 60fps | 5 |
| Spring Bounce | 150-500ms | 60fps | 3 |
| Confetti | 2000ms | 60fps | 1 |

### Storybook Stories

```typescript
// .storybook/stories/DipAlert.stories.tsx
import { DipAlertBanner } from '../../src/components/dashboard/DipAlertBanner';

export default {
  title: 'Dashboard/DipAlert',
  component: DipAlertBanner,
};

export const Default = () => (
  <DipAlertBanner
    alert={{
      symbol: 'IBIT',
      dipPercentage: 12,
      price: 85.50,
      highPrice: 97.16,
      timestamp: Date.now(),
      alertId: 'test-123',
    }}
    onTap={() => console.log('Alert tapped')}
  />
);

export const SmallDip = () => (
  <DipAlertBanner
    alert={{
      symbol: 'ETHA',
      dipPercentage: 5,
      price: 3.20,
      highPrice: 3.37,
      timestamp: Date.now(),
      alertId: 'test-456',
    }}
    onTap={() => {}}
  />
);

export const LargeDip = () => (
  <DipAlertBanner
    alert={{
      symbol: 'STCE',
      dipPercentage: 25,
      price: 2.50,
      highPrice: 3.33,
      timestamp: Date.now(),
      alertId: 'test-789',
    }}
    onTap={() => {}}
  />
);
```

---

## 🔌 Integration Testing (MSW)

### Mock Service Worker Setup

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // CoinGecko price mock
  rest.get('https://api.coingecko.com/api/v3/simple/price', (req, res, ctx) => {
    return res(
      ctx.json({
        bitcoin: { usd: 95000, usd_24h_change: -5.2 },
        ethereum: { usd: 3500, usd_24h_change: -3.1 },
      })
    );
  }),
  
  // Grok API mock
  rest.post('https://api.x.ai/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.json({
        chunks: [
          '🐻 DIP DETECTED!',
          "IBIT's down 12% - PERFECT ENTRY",
          'DCA dreams come true',
          'Buy $100 NOW',
          'TAP SCHWAB LINK',
          'Volatility = opportunity',
        ],
        action: 'buy',
        confidence: 0.94,
      })
    );
  }),
];
```

---

## ✅ Coverage Requirements

| Category | Minimum | Target |
|----------|---------|--------|
| **Schemas (Zod)** | 100% | 100% |
| **Hooks** | 80% | 90% |
| **Utils** | 70% | 85% |
| **Components** | 60% | 75% |
| **Overall** | 70% | 80% |

### Generate Coverage Report

```bash
npm test -- --coverage --coverageReporters=text-summary
```

---

## 🐛 Debug Test Helpers

```typescript
// __tests__/helpers/mockPrices.ts
export const mockBTCDip = (dipPercent: number) => ({
  symbol: 'bitcoin' as const,
  price: 95000 * (1 - dipPercent / 100),
  change24h: -dipPercent,
  timestamp: Date.now(),
});

export const mockValidTradeResponse = () => ({
  chunks: ['DIP!', 'BTC down', 'Buy now', 'HODL', 'Moon', 'LFG'],
  action: 'buy' as const,
  confidence: 0.92,
  memeLevel: 'GOD_TIER' as const,
  bearRoar: true,
});
```

---

## 🚀 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: brew tap wix/brew && brew install applesimutils
      - run: detox build --configuration ios.sim.release
      - run: detox test --configuration ios.sim.release
