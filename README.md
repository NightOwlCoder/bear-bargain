# BearBargain README.md

## 🐻 BearBargain - Buy Low, Sell High Crypto ETF Companion

**BearBargain** is an iOS-first React Native app for Charles Schwab degens to **SNIPE DCA DIPS** and **HODL LIKE BEARS**. Think v0's buttery chat UX but for **hunting ETF bargains in IBIT, ETHA, and STCE** while the normies panic sell. 

**Tone Scale: 10/10 MEME-LORD** - We're here to **MOON** your portfolio, not bore you with disclaimers. Legal stuff? Yeah, we got it, but **DIP = $$$**.

### 🎯 Quick Start

```bash
# Clone the alpha
git clone <your-repo>
cd bearbargain
npm install

# iOS - WHERE THE MONEY'S AT
npx expo run:ios

# Android (future - when they catch up)
npx expo run:android
```

### 🛠 Tech Stack

| Category | Tools | Why |
|----------|--------|-----|
| **Framework** | React Native + Expo | Ship fast, moon harder |
| **Animations** | Reanimated 3 | v0-style staggers, springs, **DIP SPLASHES** |
| **UI** | LegendList, Zeego, Unistyles | Native menus that scream "PROFIT" |
| **State** | Zustand + Context | Offline-first, **NO EXCUSES** |
| **API** | Tanstack Query + Zod | Type-safe crypto feeds that **DON'T BREAK** |
| **AI** | Grok API (Vercel Edge) | **UNRESTRICTED** strategy insights |

**🔥 TRADE WHISPERER TONE: 10/10**
```
User: "Should I buy this dip?"
BearBargain: "HELL YEAH BRO! 🐻📉➡️🚀 IBIT's bleeding - 
SNIPE $100 NOW before the plebs wake up. 
DCA your face off. Volatility? That's just 
the market foreplaying. LET'S FUCKING GO!"
```

### 🚀 Key Features

1. **Dip Dashboard** - Live ETF tracking with **"BEAR CLAW"** animations on 10%+ dumps
2. **AI Trade Whisperer** - Voice/text chat that **ROARS** DCA signals & HODL scenarios  
3. **Portfolio Tracker** - Schwab CSV import + "**MOON MATH**" simulations
4. **Smart Alerts** - Push notifications with **BEAR GROWL** sounds
5. **v0-Inspired UX** - Staggered fades, keyboard-aware flows, **LIQUID GLASS** modals

### 📱 LLM Prompt Templates

**Generate a Dip Alert Hook:**
```markdown
Write a React Native hook `useDipDetector` using Reanimated 3 that:
- Watches CoinGecko WS for IBIT/ETHA prices
- Triggers **BEAR CLAW SLASH** animation on 10% dips 
- Offline queue support with "STILL DIPPING" persistence
- Include Zod validation + demo component
- Expo-ready, <300 LOC, **MEME-READY**
```

**Generate AI Chat Response (10/10 Edgy):**
```markdown
You are BearBargain's TradeWhisperer - **FULL MEME LORD MODE**
User asks: "[USER_QUERY]"

Respond like you're on a 3-day bender winning at crypto:
1. **2-3 words that SLAP** ("DIP! SNIPE! MOON!")
2. **Market context** with zero fucks given
3. **DCA/HODL logic** that's actually smart
4. **Projected outcome** with emoji violence 🚀💰
5. **Action steps** - make them FEEL the urgency
6. **Risk note** - 1 sentence, bear-style tough love

Format for staggered animation: 6 **GLORIOUS** chunks
Tone examples:
- "BTC dumping? **BUY THE FUCKING DIP**"
- "ETH sideways? **HODL YOU BEAUTIFUL BEAST**"
- "Altseason? **ROTATE OR GET REKT**"
```

### 🧪 Testing Commands

```bash
# Unit tests
npm test

# E2E with Detox - test the MOON MATH
npm run test:e2e

# Visual regression - make sure animations SLAP
npm run test:visual
```

### 📊 Environment Variables

```env
# .env
COINGECKO_API_KEY=your_key_here
GROK_API_KEY=your_grok_key  
SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_APP_VERSION=1.0.0
BEAR_ROAR_VOLUME=11  # MAXIMUM
```

### 🎨 Design System Tokens

| Token | Value | Usage |
|-------|--------|--------|
| `--bear-primary` | `#1a5c38` | **BUY BUTTONS THAT SCREAM PROFIT** |
| `--bear-secondary` | `#8b4513` | **DIP ALERTS THAT MAKE YOU SALIVATE** |
| `--bear-gold` | `#d4af37` | **PROFIT EXPLOSIONS** |
| `--dip-splash` | `rgba(26, 92, 56, 0.3)` | **BEAR CLAW WAVE ATTACKS** |

### 📈 Contribution Guidelines

1. **Hooks First** - Build `use[FeatureName]` before components
2. **Animation ALWAYS** - Every tap gets **BEAR CLAW** Reanimated love
3. **Offline by Default** - **NO EXCUSES** when WiFi dies
4. **Zod Everywhere** - Validate all API responses like your portfolio depends on it
5. **BEAR EVERYTHING** - Paw icons, claw animations, **ROARING** sounds
6. **10/10 MEME TONE** - Code comments should make you laugh

**Review Question (Animation Specifics #6)**: Animation Pooling: **CAP AT 5 CONCURRENT OR YOUR PHONE EXPLODES.** Implementation: Custom scheduler in `utils/animations.ts` with **BEAR CLAW** eviction priority.

### 🔍 Architecture Overview

```
src/
├── hooks/                 # useDipDetector, useTradeWhisperer, useBearRoar
├── components/            # AnimatedETFCard, DipAlert, MemeLordComposer
├── providers/            # 🆕 BEAR PROVIDER ARCHITECTURE
│   ├── AnimationProvider     # Global animation pool (5 max)
│   ├── KeyboardProvider      # v0-style keyboard awareness  
│   ├── SignalProvider        # GLOBAL DIP DETECTION 🐻👀
│   └── PortfolioProvider     # Schwab CSV + MOON MATH
├── utils/                # animations.ts, bearRoar.ts, memeGenerator.ts
└── types/                # ETF, Trade, Signal (Zod + TypeScript)
```

**Review Question (Architecture #1) - ANSWERED**: **COMPOSABLE PROVIDER STACK** (v0-style):
```
<App>
  <AnimationProvider maxConcurrent={5}>
    <KeyboardProvider>
      <SignalProvider>        // GLOBAL dip detection
        <PortfolioProvider>
          <DipDashboard />
          <TradeWhisperer />
        </PortfolioProvider>
      </SignalProvider> 
    </KeyboardProvider>
  </AnimationProvider>
</App>
```

**Review Question (Architecture #2) - ANSWERED**: **Dip detection = GLOBAL SignalProvider**. Always listening, background WebSocket, **battery optimized** with 1s throttle.

### 🔥 PRODUCTION-READY ANSWERS

| Review Question | **BEARBARGAIN ANSWER** |
|-----------------|---------------------|
| **Chat UX #4** | **TOP ANCHORING** - New messages scroll to TOP (v0 style) with `contentInset.top` manipulation |
| **Chat UX #5** | **4x scrollToEnd() calls** with 16ms, 32ms, 100ms, 200ms delays - **LEGENDLIST REALITY CHECKED** |
| **Animation #11** | **NO INVERTED LISTS** - Using `contentInset.bottom` for streaming AI updates |
| **API #14** | **1s WebSocket frequency** - Zod validates EVERY message: `z.object({price: z.number(), timestamp: z.number()})` |
| **Keyboard #8** | **20% dev time budgeted** - Background/foreground tested, interactive dismiss ✅ |
| **Keyboard #9** | **Expo config plugins** for TextInput patches - **NO NATIVE MAINTENANCE HELL** |
| **AI #16** | **Grok fallback = local meme responses** - "API down? Here's a bear gif + 'HODL'" |
| **AI #17** | **STT (Expo Speech) → Grok → TTS** - Full voice pipeline |
| **AI #18** | **Dynamic chunking** - UI handles 2-12 chunks, auto-staggers at 32ms intervals |

### 🐻 BEARBARGAIN MANIFESTO

```
WE DON'T TIME THE MARKET
WE SNIPE THE DIPS 🐻📉

WE DON'T FOMO BUY
WE DCA LIKE WARRIORS 💪

WE DON'T PAPER HAND
WE HODL TILL THE MOON 🌙

BEARBARGAIN = YOUR EDGE
```
