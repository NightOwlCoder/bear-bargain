# 🐻 Task 1: Build Core Dip Detection System

**Priority:** CRITICAL - This is the app's heartbeat  
**Estimated Time:** 30-45 minutes  
**Complexity:** Medium-Hard

---

## 📋 Mission Briefing

Build the **live price feed + dip detection + bear claw explosion** system. This is BearBargain's core value proposition: watch prices → detect dips → ALERT THE USER!

---

## 🎯 What To Build

### 1. `src/hooks/useDipDetector.ts` (NEW)

**Core hook** that:
- Connects to CoinGecko WebSocket for live prices
- Validates all incoming data with Zod schemas
- Detects 10%+ dips with 2% hysteresis
- Manages state machine: `idle` → `listening` → `alert_firing` → `cooldown`
- Queues missed dips when offline

### 2. `src/components/DipAlertBanner.tsx` (NEW)

**Alert UI** that:
- Shows animated bear claw swipe across screen
- Auto-dismisses after 5 seconds
- Triggers haptic feedback
- Displays red paw badge + "% DIP!"

### 3. `src/providers/AnimationProvider.tsx` (NEW)

**Animation pool manager** that:
- Limits concurrent animations to 5
- Uses 32ms stagger delay
- Provides `useAnimationPool` hook
- Handles automatic eviction

### 4. `src/screens/DipDashboard.tsx` (NEW)

**Main dashboard** that:
- Displays ETF price cards (IBIT, ETHA, STCE)
- Integrates `useDipDetector` hook
- Renders `DipAlertBanner` when dip detected
- Shows CoinGecko attribution footer

---

## 📊 Technical Specifications

| Feature | Details | Reference |
|---------|---------|-----------|
| **ETFs** | IBIT, ETHA, STCE | `src/types/schemas.ts` |
| **Dip Threshold** | 10% (configurable via env) | `src/utils/featureFlags.ts` |
| **Hysteresis** | ±2% (prevents alert spam) | docs/StateFlows.md |
| **WS Throttle** | 1000ms intervals | `src/utils/featureFlags.ts` |
| **Animation Pool** | Max 5 concurrent | `src/utils/featureFlags.ts` |
| **Alert TTL** | 5000ms auto-dismiss | `src/utils/featureFlags.ts` |
| **Offline Queue** | Max 10 actions | `src/utils/featureFlags.ts` |

---

## 🔧 Existing Files Reference

### `src/types/schemas.ts` (USE THESE)

```typescript
// Key schemas to import:
import { 
  PriceUpdateSchema, 
  ETFPriceSchema,
  DipAlertSchema, 
  QueuedActionSchema,
  ETFSymbol,
  ETF_TO_CRYPTO 
} from '../types/schemas';

// PriceUpdateSchema validates WebSocket messages
// DipAlertSchema validates dip alert objects
// QueuedActionSchema validates offline queue items
```

### `src/constants/colors.ts` (USE THESE)

```typescript
import { COLORS, GRADIENTS } from '../constants/colors';

// Key colors:
// COLORS.bearPrimary - #1A5C38 (green, success)
// COLORS.bearSecondary - #8B4513 (brown, dip alerts)
// COLORS.lossRed - #FF5252 (dip percentage)
// COLORS.dipSplash - rgba(26, 92, 56, 0.3) (claw overlay)
```

### `src/utils/featureFlags.ts` (USE THESE)

```typescript
import { 
  DipConfig, 
  AnimationConfig, 
  AudioConfig, 
  FeatureFlags 
} from '../utils/featureFlags';

// Key configs:
// DipConfig.defaultThreshold - 10 (dip %)
// DipConfig.wsThrottleMs - 1000 (throttle)
// AnimationConfig.maxConcurrentAnims - 5
// AnimationConfig.staggerDelayMs - 32
// AnimationConfig.alertTtlMs - 5000
```

---

## 📁 File Structure After Task

```
src/
├── constants/
│   └── colors.ts              ← EXISTS
├── types/
│   └── schemas.ts             ← EXISTS
├── utils/
│   └── featureFlags.ts        ← EXISTS
├── hooks/
│   └── useDipDetector.ts      ← NEW
├── providers/
│   └── AnimationProvider.tsx  ← NEW
├── components/
│   └── DipAlertBanner.tsx     ← NEW
└── screens/
    └── DipDashboard.tsx       ← NEW
```

---

## 🧪 MANDATORY TESTING & VERIFICATION

**⚠️ CODEX MUST COMPLETE ALL TESTS BEFORE CREATING PR ⚠️**

### 1. Unit Tests (Jest) - REQUIRED

Create `__tests__/useDipDetector.test.ts`:

```typescript
// REQUIRED TEST CASES
import { calcDip } from '../src/hooks/useDipDetector';
import { DipAlertSchema, PriceUpdateSchema } from '../src/types/schemas';

describe('useDipDetector', () => {
  test('calculates 10% dip correctly', () => {
    expect(calcDip(90, 100)).toBe(10); // 90/100 = 10%
    expect(calcDip(85, 100)).toBe(15); // 85/100 = 15%
  });

  test('Zod validates CoinGecko response', () => {
    const valid = {
      symbol: 'bitcoin',
      price: 91295,
      change24h: -2.3,
      timestamp: Date.now()
    };
    expect(() => PriceUpdateSchema.parse(valid)).not.toThrow();
  });

  test('hysteresis prevents spam alerts', () => {
    // Simulate 9.5% dip → No alert (under 10% threshold)
    // Simulate 10.2% dip → Alert fires
    // Simulate 9.8% dip → No alert (within 2% hysteresis)
  });

  test('DipAlertSchema validates alert objects', () => {
    const validAlert = {
      symbol: 'IBIT',
      dipPercentage: 12.5,
      price: 85.23,
      highPrice: 97.50,
      timestamp: Date.now(),
      alertId: crypto.randomUUID()
    };
    expect(() => DipAlertSchema.parse(validAlert)).not.toThrow();
  });
});
```

**Run Command:**
```bash
npm test -- --coverage
```

**SUCCESS CRITERIA:**
```
✅ PASS: 8+ tests
✅ Coverage: >80%
✅ No Zod validation errors
```

---

### 2. E2E Tests (Manual Flow) - REQUIRED

Test the complete dip lifecycle:

| **Step** | **Action** | **Expected** | **Status** |
|----------|------------|-------------|------------|
| **1** | Start app: `npx expo start --ios` | Dashboard loads | ⏳ |
| **2** | Wait for prices | IBIT=$85.23, ETHA=$32.00 | ⏳ |
| **3** | Simulate dip | Edit price: IBIT → $76.70 (-10%) | ⏳ |
| **4** | Verify alert | Red banner appears | ⏳ |
| **5** | Verify animation | Bear claw swipes across | ⏳ |
| **6** | Verify haptic | Phone vibrates | ⏳ |
| **7** | Verify timeout | Banner auto-dismisses (5s) | ⏳ |
| **8** | Check console | "🐻 DIP DETECTED! SNIPE NOW!" | ⏳ |

---

### 3. API Integration Tests - REQUIRED

```bash
# Test live CoinGecko connection
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=$COINGECKO_API_KEY"
```

**EXPECTED OUTPUT:**
```json
{"bitcoin":{"usd":91295}}
```

**Console Verification:**
```
✅ WebSocket connected to CoinGecko
✅ Live prices loaded
```

---

### 4. Error Handling Tests - REQUIRED

| **Scenario** | **Action** | **Expected** | **Status** |
|-------------|------------|-------------|------------|
| **Network Error** | Disconnect WiFi | Bear Nap modal appears | ⏳ |
| **Invalid WS Data** | Corrupt JSON | Zod silently ignores | ⏳ |
| **Stale Data** | >5min old | "Hunt Again" banner | ⏳ |

---

### 5. MANUAL DIP SIMULATION - REQUIRED

**In DipDashboard.tsx, temporarily add this test button:**

```typescript
// TEMPORARY: Add this button for testing - REMOVE AFTER VERIFICATION
<Button 
  title="🚨 SIMULATE 12% DIP" 
  onPress={() => {
    const current = prices.IBIT;
    const dipPrice = current * 0.88;
    triggerAlert({
      symbol: 'IBIT',
      price: dipPrice,
      dipPercentage: 12,
      timestamp: Date.now()
    });
  }}
/>
```

**Test Flow:**
1. Tap "SIMULATE 12% DIP"
2. ✅ Claw animation fires
3. ✅ Vibration triggers
4. ✅ Console: "DIP DETECTED!"
5. ✅ Banner appears → 5s → dismisses
6. ✅ **Remove test button after verification**

---

## ✅ VERIFICATION CHECKLIST

**CODEX MUST CONFIRM ALL ITEMS BEFORE PR:**

| **Test** | **Command** | **Status** |
|---------|------------|-----------|
| Unit Tests | `npm test` | ⏳ |
| TypeScript | `npx tsc --noEmit` | ⏳ |
| E2E Flow | Manual dip test | ⏳ |
| API | Live CoinGecko call | ⏳ |
| Console Logs | "DIP DETECTED!" | ⏳ |
| Attribution | CoinGecko footer visible | ⏳ |

---

## 🚨 PR BLOCKERS

**DO NOT CREATE PR UNTIL:**

```
✅ [ ] npm test -- --coverage → 100% PASS
✅ [ ] npx tsc --noEmit → No errors  
✅ [ ] npx expo start --ios → No errors
✅ [ ] Manual dip test → Claw explodes 🐾💥
✅ [ ] All 8 E2E steps → ✅ SUCCESS
✅ [ ] Console logs → "DIP DETECTED!"
✅ [ ] CoinGecko attribution visible in footer
```

---

## 📊 EXPECTED PR DESCRIPTION FORMAT

**Codex MUST include this in PR description:**

```markdown
## 🐻 DIP DETECTOR TEST RESULTS

### 📊 Test Coverage
✅ Unit Tests: X/X PASSED
✅ TypeScript: No errors
✅ E2E Flow: 8/8 STEPS ✅

### 🧪 Manual Test Results
- [x] WebSocket connected
- [x] 12% dip detected
- [x] Bear claw animation working
- [x] Haptic feedback triggered
- [x] 5s auto-dismiss
- [x] CoinGecko attribution visible

### 🔧 Commands Run
npm test                    # ✅ PASSED
npx tsc --noEmit            # ✅ NO ERRORS
npx expo start --ios        # ✅ RUNNING
```

---

## 🎯 EXECUTION ORDER FOR CODEX

```
1. WRITE CODE (4 files)
2. CREATE TESTS (__tests__/useDipDetector.test.ts)
3. RUN: npm test
4. RUN: npx tsc --noEmit
5. RUN: npx expo start --ios  
6. MANUAL DIP TEST (tap simulate button)
7. VERIFY ALL CHECKLIST ITEMS
8. CREATE PR WITH TEST RESULTS
```

**🚨 NO PR WITHOUT 100% TEST PASS! 🚨**

---

## 🚀 CoinGecko API Reference

### REST Endpoint (for initial fetch)

```typescript
// GET request for simple price
const url = 'https://api.coingecko.com/api/v3/simple/price';
const params = {
  ids: 'bitcoin,ethereum',
  vs_currencies: 'usd',
  include_24hr_change: true,
  include_24hr_vol: true,
  x_cg_demo_api_key: process.env.COINGECKO_API_KEY,
};
```

### Response Shape (validate with PriceUpdateSchema)

```json
{
  "bitcoin": {
    "usd": 91295.43,
    "usd_24h_change": -2.5,
    "usd_24h_vol": 45000000000
  },
  "ethereum": {
    "usd": 3456.78,
    "usd_24h_change": 1.2,
    "usd_24h_vol": 12000000000
  }
}
```

### ETF Price Calculation

```typescript
// Map crypto prices to ETF symbols
// IBIT tracks Bitcoin at ~0.001 BTC/share
// ETHA tracks Ethereum at ~0.01 ETH/share
// STCE tracks staked ETH at ~0.01 ETH/share

const calculateETFPrice = (crypto: 'bitcoin' | 'ethereum', price: number): number => {
  const ratios = {
    bitcoin: 0.001,   // IBIT ratio
    ethereum: 0.01,   // ETHA/STCE ratio
  };
  return price * ratios[crypto];
};
```

---

## 🎨 Animation Requirements (v0 iOS Style)

### Claw Swipe Sequence

```typescript
// From docs/DesignLanguage.md
import { withSequence, withSpring, withTiming } from 'react-native-reanimated';

const clawSwipe = () => {
  'worklet';
  return withSequence(
    withSpring(-100, { damping: 12 }),  // Slash left
    withTiming(0, { duration: 150 }),    // Reset
    withSpring(50, { damping: 8 })       // Bounce right
  );
};
```

### Stagger Fade (32ms per element)

```typescript
const staggerFade = (index: number) => {
  'worklet';
  return withTiming(1, {
    duration: AnimationConfig.staggerDelayMs,
    delay: index * AnimationConfig.staggerDelayMs,
  });
};
```

### Spring Config

```typescript
const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};
```

---

## 🧪 Success Criteria

### Terminal Output (Console Logs)

```
✅ CoinGecko API connected
✅ Live prices loaded: IBIT=$85.23, ETHA=$32.00, STCE=$34.56
✅ Dip detector: ACTIVE (10% threshold)
🐻 DIP DETECTED! IBIT -12.3%
Alert ID: uuid-1234-5678
Animation pool: 1/5 active
```

### Visual Check

1. **Dashboard loads** with 3 ETF cards showing live prices
2. **Trigger dip manually** (set mock price to -12%)
3. **Bear claw animation** sweeps across screen
4. **Red badge** shows "12.3% DIP!"
5. **Phone vibrates** (heavy impact)
6. **Auto-dismiss** after 5 seconds
7. **CoinGecko attribution** visible in footer

### Type Safety Check

- No TypeScript errors
- All external data validated with Zod
- Proper error handling for WS failures

---

## 🚨 Constraints

| Rule | Reason |
|------|--------|
| **Zod validation on ALL external data** | Type safety + runtime validation |
| **Max 5 concurrent animations** | Performance on older devices |
| **32ms stagger delay** | v0 iOS-style smooth animations |
| **5s alert auto-dismiss** | Don't annoy users |
| **Use existing schemas** | Consistency across app |
| **CoinGecko attribution required** | API terms compliance |

---

## 🎯 Implementation Order

1. **AnimationProvider** (foundation)
2. **useDipDetector hook** (core logic)
3. **DipAlertBanner** (UI component)
4. **DipDashboard** (integration)
5. **Test with manual dip trigger**

---

## 📋 Deliverables Checklist

- [ ] `src/providers/AnimationProvider.tsx` with pool management
- [ ] `src/hooks/useDipDetector.ts` with state machine
- [ ] `src/components/DipAlertBanner.tsx` with claw animation
- [ ] `src/screens/DipDashboard.tsx` with ETF cards
- [ ] Console logs showing "DIP DETECTED!"
- [ ] Claw animation visible on dip
- [ ] Haptic feedback working
- [ ] CoinGecko attribution in footer

---

## 🐻 Bear Mode Behavior

When dip is detected:

```
1. 🐾 CLAW ANIMATION - Sweeps across entire screen
2. 📢 BEAR ROAR SOUND - 0.8 volume (if sound enabled)
3. 📳 HEAVY VIBRATION - HapticFeedback.impactAsync('heavy')
4. 💬 CONSOLE LOG - "🐻 DIP DETECTED! SNIPE NOW!"
5. 🔴 RED BADGE - Shows exact dip percentage
6. ⏱️ 5s TIMER - Auto-dismiss countdown
```

---

## 🔗 Reference Documents

- `docs/StateFlows.md` - Dip detector state machine diagram
- `docs/DesignLanguage.md` - Animation curves and colors
- `docs/Architecture.md` - Provider stack and data flow
- `docs/ErrorStates.md` - Network error handling
- `docs/APIKeys.md` - CoinGecko attribution requirements

---

## 🚀 Start Command

After completing task, test with:

```bash
npx expo start --ios
# Wait for simulator
# Watch live prices load
# Manually trigger dip → CLAWS EXPLODE! 🐾💥
```

---

🐻 **BUILD THE HEARTBEAT—LET'S GO!** 🚀
