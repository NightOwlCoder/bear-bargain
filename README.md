# BearBargain README.md

## 🐻 BearBargain - Buy Low, Sell High Crypto ETF Companion

**BearBargain** is an iOS-first React Native app for Charles Schwab users to master DCA during crypto dips and HODL with AI-powered insights. Think v0's buttery chat UX but for hunting ETF bargains in IBIT, ETHA, and STCE.

### 🎯 Quick Start

```bash
# Clone & install
git clone <your-repo>
cd bearbargain
npm install

# iOS development
npx expo run:ios

# Android (future)
npx expo run:android
```

### 🛠 Tech Stack

| Category | Tools | Why |
|----------|--------|-----|
| **Framework** | React Native + Expo | Rapid iteration, native feel |
| **Animations** | Reanimated 3 | v0-style staggers, springs, liquid glass |
| **UI** | LegendList, Zeego, Unistyles | Native menus, virtualized lists, themes |
| **State** | Zustand + Context | Offline-first, performant |
| **API** | Tanstack Query + Zod | Type-safe crypto feeds |
| **AI** | Grok API (Vercel Edge) | Unrestricted strategy insights |

### 🚀 Key Features

1. **Dip Dashboard** - Live ETF tracking with "splash" animations on 10%+ drops
2. **AI Trade Whisperer** - Voice/text chat for DCA signals & HODL scenarios
3. **Portfolio Tracker** - Schwab CSV import + "what-if" simulations
4. **Smart Alerts** - Push notifications with bear growl sounds
5. **v0-Inspired UX** - Staggered fades, keyboard-aware flows, liquid glass modals

### 📱 LLM Prompt Templates

**Generate a Dip Alert Hook:**
```markdown
Write a React Native hook `useDipDetector` using Reanimated 3 that:
- Watches CoinGecko WS for IBIT/ETHA prices
- Triggers staggered fade-in alert on 10% dips with spring bounce
- Offline queue support
- Include Zod validation + demo component
- Expo-ready, <300 LOC
```

**Generate AI Chat Response:**
```markdown
You are BearBargain's Trade Whisperer. User asks: "[USER_QUERY]"
Respond in 3-5 sentences with:
1. Direct answer (edgy, no moralizing)
2. DCA/HODL rationale 
3. Risk note (1 sentence max)
4. Action suggestion (deep-link to Schwab)
Format for staggered animation: break into 4-6 chunks
```

### 🧪 Testing Commands

```bash
# Unit tests
npm test

# E2E with Detox
npm run test:e2e

# Visual regression
npm run test:visual
```

### 📊 Environment Variables

```env
# .env
COINGECKO_API_KEY=your_key_here
GROK_API_KEY=your_grok_key
SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 🎨 Design System Tokens

| Token | Value | Usage |
|-------|--------|--------|
| `--bear-primary` | `#1a5c38` | Buy buttons, success |
| `--bear-secondary` | `#8b4513` | Alerts, dips |
| `--bear-gold` | `#d4af37` | Profits, sells |
| `--dip-splash` | `rgba(26, 92, 56, 0.3)` | Chart dip waves |

### 📈 Contribution Guidelines

1. **Hooks First** - Build `use[FeatureName]` before components
2. **Animation Always** - Every interaction gets Reanimated love
3. **Offline by Default** - Zustand persistence on all data
4. **Zod Everywhere** - Validate all API responses
5. **Bear Everything** - Paw icons, claw animations, growl sounds

### 🔍 Architecture Overview

```
src/
├── hooks/           # useDipDetector, useTradeWhisperer, usePortfolioSync
├── components/      # AnimatedETFCard, DipAlert, TradeComposer
├── providers/       # PortfolioProvider, SignalProvider
├── utils/           # animations.ts, validators.ts
├── screens/         # Dashboard, Chat, Portfolio, Settings
└── types/           # ETF, Trade, Signal (Zod + TypeScript)
```
