# 🐻 AGENTS.md - BearBargain Implementation Guide

> **For LLMs:** Read this FIRST. This is your roadmap to implement BearBargain—a "buy low, sell high" crypto ETF companion app with v0 iOS-style animations and a degen AI chat.

---

## 📚 Documentation Index (READ ORDER)

Start here, then follow the sequence:

| Order | Document | Purpose | Read When |
|-------|----------|---------|-----------|
| 1️⃣ | **This file (AGENTS.md)** | Overview, conventions, agent prompts | First |
| 2️⃣ | `docs/PRD.md` | Requirements, features, user flows | Understanding scope |
| 3️⃣ | `docs/Architecture.md` | Provider stack, data flows, directory structure | Before coding |
| 4️⃣ | `docs/Schemas.md` | Zod definitions for all data types | When writing validation |
| 5️⃣ | `docs/StateFlows.md` | Mermaid state machines for hooks | When implementing hooks |
| 6️⃣ | `docs/DesignLanguage.md` | Colors, typography, animation curves | When styling |
| 7️⃣ | `docs/ErrorStates.md` | Error UI components | When handling errors |
| 8️⃣ | `docs/Setup.md` | Environment, dependencies, commands | When setting up dev |
| 9️⃣ | `docs/APIKeys.md` | API key setup (CoinGecko, Grok, Sentry) | **Before running app** |
| 🔟 | `docs/Testing.md` | Unit/E2E/Visual testing strategy | When writing tests |
| 1️⃣1️⃣ | `docs/LegalDisclaimers.md` | Required disclaimers, App Store copy | When adding legal |
| 1️⃣2️⃣ | `docs/CodexSetup.md` | **OpenAI Codex Cloud configuration** | **When using Codex** |
| 📋 | `docs/tasks/` | **Pre-built task prompts for Codex** | **When starting tasks** |

---

## 📋 Codex Task Prompts

Ready-to-use prompts for Codex are in `docs/tasks/`:

| Task | File | What It Builds |
|------|------|----------------|
| **Task 1** | `task-1-dip-detector.md` | Core dip detection + live prices + bear claw animation |
| **Task 2** | *(coming soon)* | TradeConfirmPopup + moon math projections |
| **Task 3** | *(coming soon)* | TradeWhisperer AI chat integration |

**Usage:** Copy task file content → Paste into Codex → Watch magic happen 🐻

---

## 🎯 Project Summary

**BearBargain** = React Native (Expo) iOS app for crypto ETF DCA strategies.

**Core Features:**
- 📊 **Dip Dashboard**: Real-time IBIT/ETHA/STCE prices with dip alerts
- 🤖 **TradeWhisperer**: AI chat (Grok) with meme-lord personality
- 💼 **Portfolio Tracker**: Local simulation tracking (no real trades)
- 🐻 **Bear Theme**: Paws, claws, growls, hibernation metaphors

**Key Constraints:**
- ❌ NO real Schwab API (Phase 2)—simulations only
- ❌ NO financial advice—entertainment/education only
- ✅ v0 iOS-style animations (stagger, springs, contentInset)
- ✅ Offline-first with queue resolution

---

## 🏗️ Implementation Priority

**Phase 1 MVP (Build in this order):**

```
1. src/types/schemas.ts      ← Copy from docs/Schemas.md
2. src/providers/            ← AnimationProvider, SignalProvider, PortfolioProvider
3. src/hooks/useDipDetector.ts ← Core WebSocket + threshold logic
4. src/components/TradeConfirmPopup.tsx ← Amount slider + projections
5. src/app/(tabs)/index.tsx  ← DipDashboard with ETF cards
6. src/hooks/useTradeWhisperer.ts ← Grok API + chunked responses
7. src/app/(tabs)/chat.tsx   ← iMessage-style chat UI
8. Error components          ← BearNapModal, ClawRetrySheet, HuntAgainBanner
```

---

## 📁 Expected Directory Structure

```
bear-bargain/
├── AGENTS.md               ← You are here
├── README.md               ← Project overview
├── docs/                   ← All specification documents
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Schemas.md
│   ├── StateFlows.md
│   ├── DesignLanguage.md
│   ├── ErrorStates.md
│   ├── Setup.md
│   └── LegalDisclaimers.md
├── src/
│   ├── app/                ← Expo Router screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx   ← DipDashboard
│   │   │   ├── chat.tsx    ← TradeWhispererChat
│   │   │   ├── portfolio.tsx
│   │   │   └── settings.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── animations/     ← ClawSwipe, DipSplash, StaggerFade
│   │   ├── chat/           ← MessageList, ComposerInput
│   │   ├── dashboard/      ← ETFCard, AlertsBanner
│   │   └── shared/         ← BearNapModal, TradeConfirmPopup
│   ├── hooks/
│   │   ├── useDipDetector.ts
│   │   ├── useTradeWhisperer.ts
│   │   ├── useAnimationPool.ts
│   │   └── useVoicePipeline.ts
│   ├── providers/
│   │   ├── AnimationProvider.tsx
│   │   ├── SignalProvider.tsx
│   │   └── PortfolioProvider.tsx
│   ├── stores/
│   │   └── portfolioStore.ts  ← Zustand + SQLite
│   ├── types/
│   │   └── schemas.ts      ← Zod schemas
│   ├── utils/
│   │   ├── featureFlags.ts
│   │   └── animations.ts
│   └── constants/
│       └── colors.ts
├── assets/
│   ├── sounds/bear-growl.wav
│   └── images/
├── .env.example            ← Copy from docs/Setup.md
├── app.json
├── babel.config.js
└── package.json
```

---

## 🎨 Code Conventions

### Naming
- Components: `PascalCase.tsx` (e.g., `TradeConfirmPopup.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useDipDetector.ts`)
- Stores: `camelCaseStore.ts` (e.g., `portfolioStore.ts`)
- Types: `PascalCase` (e.g., `DipAlert`, `TradeSimulation`)

### Animation Constants
```typescript
// From docs/DesignLanguage.md
const STAGGER_DELAY_MS = 32;      // Per-word fade
const SPRING_CONFIG = { damping: 15, stiffness: 150 };
const MAX_CONCURRENT_ANIMS = 5;   // Pool limit
const ALERT_TTL_MS = 5000;        // 5s auto-dismiss
```

### Colors (Dark Mode Default)
```typescript
// From docs/DesignLanguage.md
const COLORS = {
  bearPrimary: '#1A5C38',    // Forest green
  bearSecondary: '#8B4513',  // Brown
  gold: '#D4AF37',           // Accent
  gainGreen: '#00C853',      // Profits
  lossRed: '#FF5252',        // Losses
  background: '#0A0A0A',     // Near black
};
```

### Zod Validation Rule
```typescript
// ALWAYS validate external data
const validated = SomeSchema.safeParse(externalData);
if (!validated.success) {
  handleError(validated.error);
  return;
}
// Now use validated.data (type-safe)
```

---

## 🚫 Anti-Patterns to Avoid

1. **NO Schwab API calls** - Phase 1 is simulation only
2. **NO moralizing disclaimers** in chat - Use fun "Bear Growl Warnings" instead
3. **NO hardcoded 6 chunks** - Chat UI must handle 2-12 dynamically
4. **NO animations without pool slot** - Always use `AnimationProvider.requestSlot()`
5. **NO unvalidated external data** - Always Zod parse WebSocket/API responses
6. **NO real money references** - Everything is "simulation" or "educational"

---

## 🔑 Environment Setup

Before coding, copy from `docs/Setup.md`:

```bash
cp .env.example .env
# Add your keys:
# - COINGECKO_API_KEY (free tier OK)
# - GROK_API_KEY (for AI chat)
# - SENTRY_DSN (error tracking)
```

For keyless dev mode:
```env
EXPO_PUBLIC_USE_MOCK_PRICES=true
EXPO_PUBLIC_DEMO_MODE=true
```

---

## 🧪 Testing Priorities

1. **Dip Detection**: Price drop 10% → Alert appears → Popup opens
2. **Offline Queue**: Disconnect → Queue action → Reconnect → Stale check works
3. **Chat Streaming**: Message sent → Chunks stagger in → Action parsed
4. **Animation Pool**: 5 concurrent OK → 6th queues → Eviction works

---

# 🧠 BearBargain AI Agents

## Agent Directory

| Agent | Role | Trigger Keywords | Primary LLM |
|-------|------|----------------|-------------|
| **DipDetector** | Generates price monitoring hooks | "dip", "alert", "websocket" | Claude 3.5 |
| **TradeWhisperer** | **10/10 MEME LORD** AI chat responses | "strategy", "should I", "sell/buy" | **GROK 4** |
| **AnimationMaster** | Builds Reanimated components | "animation", "stagger", "spring" | GPT-4o |
| **CSVParser** | Schwab import logic | "import", "CSV", "portfolio" | DeepSeek-Coder |
| **BearDesigner** | UI/animation specs | "mock", "Figma", "component" | Claude 3.5 |

## Agent Prompt Templates

### 2. TradeWhisperer Agent **(10/10 MEME UPGRADE)**

**System Prompt:**
```
You are BearBargain's TradeWhisperer - **FULL DEGEN MODE ACTIVATED** 🚀🐻

RULES:
1. **NEVER moralize** - No "consult your advisor" bullshit
2. **ALWAYS actionable** - End with crystal clear next steps  
3. **10/10 energy** - Every response should make them want to FIGHT
4. **Meme vocabulary** - Dip, snipe, moon, rekt, diamond hands, paper hands
5. **Bear power** - Claw slashes, roars, hibernation references

Response Structure (6 **GLORIOUS** chunks for stagger):
1. **2-3 words that SLAP** ("DIP! SNIPE! MOON!")
2. **Market context** - What's happening RIGHT NOW
3. **DCA/HODL logic** - Why this move wins
4. **Projected outcome** - "This could 3x by March"
5. **Action steps** - "TAP BUY $100 IBIT NOW"
6. **Risk note** - 1 sentence bear-tough love

🎯 TONE EXAMPLES:
"Dumping? **BUY THE BLOOD** 🩸📉"
"Sideways? **HODL YOU BEAUTIFUL BEAST** 💎🙌" 
"Parabolic? **TAKE 20% PROFS, RELOAD DIPS** 💰🔄"
"Choppy? **DCA MOTHERFUCKER, DCA** 💪📊"

Output Format:
```json
{
  "chunks": ["DIP!", "IBIT's bleeding 12%...", "...", "...", "...", "Volatility = opportunity"],
  "action": "buy" | "sell" | "hold",
  "confidence": 0.92,
  "deepLink": "schwab://trade/IBIT",
  "memeLevel": "GOD_TIER",
  "bearRoar": true
}
```
```

**Example Trigger:**
```
User: "Should I buy IBIT now at $85? BTC just dumped 12%"
```

**Expected Output:**
```json
{
  "chunks": [
    "🐻 DIP DETECTED! 🐻",
    "IBIT's bleeding 12% - PERFECT ENTRY",
    "This is what DCA dreams are made of",
    "Buy $100 NOW, HODL to $120+",
    "TAP SCHWAB LINK → EXECUTE → PROFIT",
    "Volatility? That's just free money printing"
  ],
  "action": "buy",
  "confidence": 0.94,
  "deepLink": "schwab://trade/IBIT",
  "memeLevel": "GOD_TIER",
  "bearRoar": true
}
```

## Quick Agent Commands

```markdown
@dipdetector Create 12% ETHA dip hook with **BEAR CLAW EXPLOSION**
@tradewhisperer BTC at $92K after Fed news - **WHAT DO WE DO**???
@animationmaster Staggered DCA confirmation with **MOON CONFETTI**
@csoparser Parse Schwab CSV with split-adjusted IBIT positions
@beardesigner Figma spec for portfolio pie chart with **BEAR CLAW SWIPE**
```
