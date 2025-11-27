# 🏗️ BearBargain Architecture Overview

**Version 1.0** - High-level blueprint for MVP. Data flows top-down; components hook-first. No monoliths—modular AF.

## 📊 Component Hierarchy

```
App.tsx (Root)
├── Providers Stack (Animation → Keyboard → Signal → Portfolio)
│   ├── AnimationProvider          # Reanimated pool (max 5)
│   ├── KeyboardProvider           # v0-style scroll/contentInset
│   ├── SignalProvider             # Global WS + dip detection
│   └── PortfolioProvider          # Local state + CSV sync
├── Screens/
│   ├── DipDashboard.tsx           # Home: ETF cards + alerts
│   │   ├── AnimatedETFCard.tsx    # Per-ETF: Price, claw swipe
│   │   └── ActiveAlertsBanner.tsx # Staggered dip notifications
│   ├── TradeWhispererChat.tsx     # iMessage: Voice STT → Grok → TTS
│   │   ├── MessageList.tsx        # LegendList, top-anchor scroll
│   │   └── ComposerInput.tsx      # Keyboard-aware text/voice
│   ├── PortfolioTracker.tsx       # CSV import + sims
│   │   ├── WhatIfSimulator.tsx    # Reanimated growth arcs
│   │   └── TradeHistoryList.tsx   # Virtualized past DCAs
│   └── Settings.tsx               # Thresholds, themes, premium
└── Shared/
    ├── utils/                     # animations.ts, validators.ts
    ├── hooks/                     # useDipDetector, useTradeSim
    └── types/                     # Zod schemas + TS interfaces
```

## 🔌 Provider Stack Architecture

Following v0 iOS's composable provider pattern, providers wrap the app in dependency order:

```tsx
// App.tsx
export default function App() {
  return (
    <AnimationProvider maxConcurrent={5}>
      <KeyboardProvider>
        <SignalProvider throttleMs={1000}>
          <PortfolioProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PortfolioProvider>
        </SignalProvider>
      </KeyboardProvider>
    </AnimationProvider>
  );
}
```

### Provider Responsibilities

| Provider | State Owned | Exposed Hooks | Key Methods |
|----------|-------------|---------------|-------------|
| **AnimationProvider** | Active animation count, eviction queue | `useAnimationPool()` | `requestSlot()`, `releaseSlot()` |
| **KeyboardProvider** | Keyboard height, visibility, scroll offset | `useKeyboardState()` | `scrollToEnd()`, `getBlankSize()` |
| **SignalProvider** | Live prices, active alerts, WS connection | `useDipDetector()`, `usePrices()` | `subscribe()`, `unsubscribe()` |
| **PortfolioProvider** | Holdings, history, offline queue | `usePortfolio()`, `useTradeHistory()` | `addTrade()`, `syncQueue()` |

## 🔄 Data Flows

### 1. Dip Detection Flow (Real-Time)

```
┌─────────────────┐    1s throttle    ┌──────────────────┐
│  CoinGecko WS   │ ──────────────────▶│  SignalProvider  │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                    Zod validate │ z.object({
                                                │   price: z.number(),
                                                │   timestamp: z.number()
                                                │ })
                                                ▼
                                    ┌──────────────────────┐
                                    │   useDipDetector()   │
                                    │   dip >= threshold?  │
                                    └──────────┬───────────┘
                                               │ YES
                                               ▼
                              ┌────────────────────────────────┐
                              │  BEAR CLAW ANIMATION TRIGGER   │
                              │  AnimationProvider.requestSlot()│
                              └────────────────┬───────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │      ActiveAlertsBanner        │
                              │      (5s TTL, staggered)       │
                              └────────────────┬───────────────┘
                                               │ User tap
                                               ▼
                              ┌────────────────────────────────┐
                              │      TradeConfirmPopup         │
                              │   (Amount slider + projections) │
                              └────────────────┬───────────────┘
                                               │ Simulate
                                               ▼
                              ┌────────────────────────────────┐
                              │      PortfolioProvider         │
                              │      (Local history log)       │
                              └────────────────────────────────┘
```

### 2. AI Chat Flow (Interactive)

```
┌───────────────────┐
│  User Input       │
│  (Text / Voice)   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐     STT      ┌───────────────────┐
│  ComposerInput    │ ◀──────────▶ │  Expo Speech      │
└─────────┬─────────┘              └───────────────────┘
          │
          ▼
┌───────────────────┐
│  Vercel Edge      │
│  (Grok API)       │
└─────────┬─────────┘
          │
          │ API Fail?
          ├──────────────────────────┐
          │                          ▼
          │               ┌───────────────────┐
          │               │  Local Fallback   │
          │               │  (Meme + HODL)    │
          │               └─────────┬─────────┘
          │                         │
          ▼                         │
┌───────────────────┐               │
│  JSON Response    │◀──────────────┘
│  (2-12 chunks)    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  MessageList      │
│  Stagger: 32ms    │
│  Top-anchor scroll│
└─────────┬─────────┘
          │
          │ Action detected? ("buy IBIT $100")
          ▼
┌───────────────────┐
│  TradeConfirmPopup│
└───────────────────┘
```

### 3. Offline Queue Flow (Resilient)

```
┌───────────────────┐
│  Action Triggered │
│  (App Offline)    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Zustand Persist  │
│  → SQLite Queue   │
│  Status: QUEUED   │
└─────────┬─────────┘
          │
          │ Reconnect detected
          ▼
┌───────────────────┐
│  SignalProvider   │
│  Re-fetch prices  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────────────────┐
│           STALE CHECK                      │
│   Price delta > 20% since queued?          │
└─────────┬─────────────────────┬────────────┘
          │ NO                  │ YES
          ▼                     ▼
┌─────────────────┐    ┌─────────────────────┐
│     FRESH       │    │      PROMPT          │
│  Auto-execute   │    │  "Price moved 25%—   │
│  → Confetti     │    │   still DCA?"        │
└─────────────────┘    └──────────┬──────────┘
                                  │
                       ┌──────────┴──────────┐
                       │ YES                 │ NO
                       ▼                     ▼
              ┌─────────────────┐   ┌─────────────────┐
              │    EXECUTE      │   │    EXPIRED      │
              │  Updated amount │   │  "Bear missed   │
              └─────────────────┘   │   this dip 😴"  │
                                    └─────────────────┘

Timeout Rule: QUEUED > 1hr → Auto-EXPIRED
```

### 4. Premium Gating Flow (Monetized)

```
┌───────────────────┐
│  Feature Request  │
│  (e.g., sim #4)   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  FeatureFlags.ts  │
│  isPremium()      │
└─────────┬─────────┘
          │
     ┌────┴────┐
     │         │
     ▼         ▼
┌─────────┐  ┌─────────────────┐
│  FREE   │  │    PREMIUM      │
│ 3/day   │  │   Unlimited +   │
│ limit   │  │   Custom AI     │
└────┬────┘  │   Personas      │
     │       └────────┬────────┘
     │                │
     ▼                │
┌─────────────┐       │
│ PaywallModal│       │
│  $4.99/mo   │───────┘
│ (RevenueCat)│
└─────────────┘
```

## 🛡️ State Management

### Global State (Zustand)

```typescript
// stores/portfolioStore.ts
interface PortfolioStore {
  holdings: Holding[];
  history: Trade[];
  offlineQueue: QueuedAction[];
  
  addHolding: (holding: Holding) => void;
  addTrade: (trade: Trade) => void;
  queueAction: (action: QueuedAction) => void;
  processQueue: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      // ... implementation
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => SQLiteStorage),
    }
  )
);
```

### Local State (Context)

```typescript
// Per-screen state that doesn't need persistence
const ChatContext = createContext<{
  selectedMessageId: string | null;
  isRecording: boolean;
}>({ selectedMessageId: null, isRecording: false });
```

### Animation State (Reanimated)

```typescript
// Shared values live outside React state
const translateY = useSharedValue(0);
const opacity = useSharedValue(1);

// No re-renders when values change
useAnimatedReaction(
  () => translateY.value,
  (current) => {
    if (current < -100) {
      runOnJS(handleDismiss)();
    }
  }
);
```

### Feature Flags

```typescript
// src/utils/featureFlags.ts
import Constants from 'expo-constants';
import { useRevenueCat } from '@/hooks/useRevenueCat';

// Premium feature gating
export const FeatureFlags = {
  // Check RevenueCat subscription status
  isPremium: (): boolean => {
    const { hasActiveSubscription } = useRevenueCat();
    return hasActiveSubscription;
  },
  
  // Free tier limits
  maxFreeSims: 3,
  maxFreeAlerts: 5,
  
  // Premium unlocks
  PREMIUM_SIMS: true,           // Unlimited simulations
  PREMIUM_PERSONAS: true,       // Custom AI personas (Degen Bear, Chill HODLer)
  PREMIUM_ALERTS: true,         // Unlimited custom alerts
  PREMIUM_VOICE: true,          // TTS responses
  
  // Remote config for A/B tests
  isFeatureEnabled: (feature: FeatureKey): boolean => {
    const remoteConfig = Constants.expoConfig?.extra?.features;
    return remoteConfig?.[feature] ?? false;
  },
  
  // Gate a feature based on premium status
  canAccess: (feature: PremiumFeature): boolean => {
    const premium = FeatureFlags.isPremium();
    if (premium) return true;
    
    // Free tier checks
    switch (feature) {
      case 'simulation':
        return getDailySimCount() < FeatureFlags.maxFreeSims;
      case 'alert':
        return getActiveAlertCount() < FeatureFlags.maxFreeAlerts;
      default:
        return false;
    }
  },
};

type FeatureKey = 'voiceEnabled' | 'newDashboard' | 'betaFeatures';
type PremiumFeature = 'simulation' | 'alert' | 'persona' | 'voice';

// Usage example:
// if (!FeatureFlags.canAccess('simulation')) {
//   showPaywallModal();
//   return;
// }
```

## 🔌 External Integrations

| Service | Interface | Auth | Fallback |
|---------|-----------|------|----------|
| **CoinGecko** | WebSocket + REST | API Key (optional) | 5min cached prices |
| **Grok API** | Vercel Edge Function | Server-side key | Local meme responses |
| **Expo Speech** | Native module | None | Text-only mode |
| **Expo Push** | Expo servers | Push token | In-app banners |
| **RevenueCat** | SDK | API Key | Free tier only |
| **Schwab** | Deep-link (Phase 2) | None | TradeConfirmPopup |
| **Sentry** | SDK | DSN | Silent fail |
| **Firebase Analytics** | SDK | Config | Offline events queue |

### API Client Structure

```typescript
// api/client.ts
import { createApiClient } from '@tanstack/react-query';
import { z } from 'zod';

export const PriceSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change24h: z.number(),
  timestamp: z.number(),
});

export type Price = z.infer<typeof PriceSchema>;

export const api = {
  prices: {
    get: async (symbols: string[]): Promise<Price[]> => {
      const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
      const data = await response.json();
      return z.array(PriceSchema).parse(data);
    },
  },
  
  ai: {
    chat: async (message: string): Promise<ChatResponse> => {
      // Vercel Edge Function call
    },
  },
};
```

## 🚨 Error Handling

### Error Boundary Structure

```tsx
// components/ErrorBoundary.tsx
<ErrorBoundary
  fallback={(error, resetError) => (
    <BearNapModal
      type={getErrorType(error)}
      onRetry={resetError}
    />
  )}
>
  <App />
</ErrorBoundary>
```

### Error Types

| Type | UI Component | User Message | Auto-Retry |
|------|--------------|--------------|------------|
| `NETWORK_ERROR` | BearNapModal | "Market hibernating—check your connection!" | Yes (3x, 3s backoff) |
| `API_ERROR` | BearNapModal | "Grok took a nap. Try again?" | Yes (1x) |
| `STALE_DATA` | InlineBanner | "Prices are {X}min old. Tap to refresh." | No |
| `VALIDATION_ERROR` | Toast | "Invalid data received. Logged for our cubs." | No |

## 📁 Directory Structure

```
src/
├── app/                      # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx         # DipDashboard
│   │   ├── chat.tsx          # TradeWhispererChat
│   │   ├── portfolio.tsx     # PortfolioTracker
│   │   └── settings.tsx      # Settings
│   └── _layout.tsx           # Root layout with providers
├── components/
│   ├── animations/           # Reanimated components
│   │   ├── ClawSwipe.tsx
│   │   ├── DipSplash.tsx
│   │   └── StaggerFade.tsx
│   ├── chat/
│   │   ├── MessageList.tsx
│   │   ├── ComposerInput.tsx
│   │   └── MessageBubble.tsx
│   ├── dashboard/
│   │   ├── ETFCard.tsx
│   │   └── AlertsBanner.tsx
│   └── shared/
│       ├── BearNapModal.tsx
│       ├── TradeConfirmPopup.tsx
│       └── Button.tsx
├── hooks/
│   ├── useDipDetector.ts
│   ├── useAnimationPool.ts
│   ├── useKeyboardAwareScroll.ts
│   └── useTradeWhisperer.ts
├── providers/
│   ├── AnimationProvider.tsx
│   ├── KeyboardProvider.tsx
│   ├── SignalProvider.tsx
│   └── PortfolioProvider.tsx
├── stores/
│   ├── portfolioStore.ts
│   └── settingsStore.ts
├── api/
│   ├── client.ts
│   └── schemas.ts
├── utils/
│   ├── animations.ts
│   ├── validators.ts
│   ├── featureFlags.ts
│   └── formatters.ts
├── types/
│   └── index.ts
└── constants/
    ├── colors.ts
    └── config.ts
```

## 🎯 Platform Boundaries

### Shared Code (`/core` equivalent)
- All hooks
- All stores
- All API clients
- All Zod schemas
- All utility functions

### Platform-Specific (`/ios`, `/android`)
- Native module patches (TextInput behavior)
- Platform-specific animations (Liquid Glass iOS only)
- Push notification handlers
- Deep-link handlers

```typescript
// Example platform split
import { Platform } from 'react-native';

export const BlurView = Platform.select({
  ios: () => require('./BlurView.ios').default,
  android: () => require('./BlurView.android').default,
})();
```

## 🔒 Security Considerations

1. **No sensitive data in client**: All API keys on Vercel Edge
2. **Local-only portfolio data**: SQLite with no cloud sync
3. **No real trades**: Simulation only (Phase 1)
4. **Input validation**: Zod on all external data
5. **Error sanitization**: No stack traces to users

## 📈 Scalability Notes

- **Edge Functions**: AI calls serverless, scales automatically
- **WebSocket pooling**: Single connection per session
- **Animation eviction**: Prevents memory bloat
- **List virtualization**: LegendList for large histories
- **Image caching**: Expo Image for ETF logos
