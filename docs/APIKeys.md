# 🔑 BearBargain API Keys: Complete Setup Guide

**Version 1.0** - Get all API keys in 15 minutes. FREE tier available for MVP.

---

## 📊 API Keys Breakdown

| Key | **What It Does** | **Cost** | **Required?** | **Priority** |
|-----|-----------------|----------|--------------|-------------|
| **COINGECKO_API_KEY** | **Real-time crypto prices** (BTC/ETH for IBIT/ETHA tracking) | **FREE** (10K calls/mo) | ✅ **YES** | 🥇 **#1** |
| **GROK_API_KEY** | **AI TradeWhisperer** (meme-lord chat responses) | **$5-20/mo** | ⚠️ **Phase 2** | 🥈 **#2** |
| **SENTRY_DSN** | **Error tracking** (crash reports, bug hunting) | **FREE** (5K errors/mo) | ✅ **YES** | 🥉 **#3** |
| **REVENUECAT_API_KEY** | **Premium subscriptions** ($4.99/mo unlimited sims) | **FREE** (first 10K users) | ❌ **Phase 2** | 🟢 **Later** |

---

## 🚀 Step-by-Step: Get Your Keys (15 Minutes)

### 1. COINGECKO_API_KEY 🥇 (5 minutes - MOST IMPORTANT)

**What it powers:** Real-time IBIT/ETHA/STCE prices via WebSocket

```bash
# 1. Go to CoinGecko API Dashboard
https://www.coingecko.com/en/api

# 2. Sign up (FREE)
Email → Password → Verify

# 3. Create API Key
Click "Create API Key" 
Name: "BearBargain"
Plan: "Demo" (FREE - 10K calls/month)

# 4. Copy your key
Looks like: CG-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

# 5. Paste in .env
COINGECKO_API_KEY=CG-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**FREE Tier Limits:**

| Endpoint | Calls/Minute | Calls/Month |
|----------|-------------|-------------|
| `/simple/price` | 30 | 10,000 |
| WebSocket | Unlimited | 10,000 |
| **BearBargain Usage** | ✅ **~300/day** | ✅ **Safe** |

---

### 2. SENTRY_DSN 🥉 (5 minutes - ERROR TRACKING)

**What it powers:** Crash reports + performance monitoring

```bash
# 1. Create Sentry Account
https://sentry.io/signup/
Email → Verify

# 2. Create New Project
Platform: "React Native"
Project Name: "BearBargain"
Organization: "NightOwlCoder"

# 3. Install SDK (automatic)
Sentry will show: `npm install @sentry/react-native`

# 4. Copy DSN
Looks like: https://abc123@sentry.io/123456

# 5. Paste in .env
SENTRY_DSN=https://abc123@sentry.io/123456
```

**FREE Tier:**
- **5K errors/month**
- **Unlimited users**
- **iOS + Android**
- **BearBargain:** ✅ **Perfect for MVP**

---

### 3. GROK_API_KEY 🥈 (Phase 2 - SKIP FOR NOW)

**What it powers:** AI TradeWhisperer ("DIP! SNIPE! MOON!")

**Options:**

| Provider | Cost | Setup Time | Quality |
|----------|------|------------|---------|
| **Grok API** | $5-20/mo | 2 min | 🐻 **Best** (our spec) |
| **OpenAI GPT-4o** | $20/mo | 2 min | 🔥 **Great** |
| **Anthropic Claude** | $3-15/mo | 2 min | 🤖 **Solid** |
| **Local Fallback** | **FREE** | 5 min | 😴 **Meme-only** |

**For MVP - Use FREE LOCAL FALLBACK:**

```env
# .env - Phase 1 (NO API COST)
GROK_API_KEY=dummy_local_fallback
```

**Later (Phase 2) - Real AI:**

```bash
# xAI Grok API
1. Go: https://console.x.ai/
2. Sign up → Get $10 free credits
3. Create API Key
4. Paste: GROK_API_KEY=xai-abc123...
```

---

### 4. REVENUECAT_API_KEY 🟢 (Phase 2 - SKIP)

**What it powers:** Premium subscriptions ($4.99/mo)

```env
# .env - Phase 1 (FREE)
REVENUECAT_API_KEY=dummy_premium_disabled
```

**Setup when ready:**

```bash
# 1. Create RevenueCat Account
https://www.revenuecat.com/
Email → Verify

# 2. Create New Project
Platform: "iOS"
App Name: "BearBargain"

# 3. Configure Products
- Monthly: $4.99/mo "Bear Premium"
- Annual: $39.99/yr "Bear Premium Annual"

# 4. Get API Key
Project Settings → API Keys → Public API Key

# 5. Paste in .env
REVENUECAT_API_KEY=appl_XXXXxxxXXXX
```

---

## 📝 Your .env File - Copy This Exactly

Create `.env` in your project root:

```env
# ========================================
# 🐻 BEARBARGAIN ENVIRONMENT VARIABLES
# ========================================

# API Keys (REQUIRED)
COINGECKO_API_KEY=CG-YOUR-KEY-HERE
GROK_API_KEY=dummy_local_fallback

# Error Tracking (RECOMMENDED)
SENTRY_DSN=https://abc123@sentry.io/123456

# Monetization (OPTIONAL for Phase 1)
REVENUECAT_API_KEY=dummy_premium_disabled

# ========================================
# Feature Flags & App Config
# ========================================
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_PREMIUM_ENABLED=false
EXPO_PUBLIC_DEMO_MODE=true

# Bear Animations & Sounds
EXPO_PUBLIC_BEAR_ROAR_VOLUME=0.8
EXPO_PUBLIC_DIP_ALERT_VIBRATION=true

# Dip Detection Settings
EXPO_PUBLIC_DEFAULT_DIP_THRESHOLD=10
EXPO_PUBLIC_ALERT_TTL_MS=5000
EXPO_PUBLIC_WS_THROTTLE_MS=1000

# Animation Config
EXPO_PUBLIC_MAX_CONCURRENT_ANIMS=5
EXPO_PUBLIC_STAGGER_DELAY_MS=32

# ========================================
# Development
# ========================================
EXPO_PUBLIC_USE_MOCK_PRICES=false
EXPO_PUBLIC_BYPASS_PAYWALL=false
```

---

## ✅ Verification Checklist

After adding keys, test this:

```bash
# 1. Start app
npx expo start --ios

# 2. Check console for:
✅ "CoinGecko WS Connected"
✅ "Initial prices loaded: IBIT=$85.23"
✅ "Dip detector: ACTIVE"
❌ "Missing COINGECKO_API_KEY" ← ADD IT!

# 3. Test dip detection:
# Edit mock price to -12%
# Reload → BEAR CLAW SHOULD EXPLODE 🐾
```

---

## 🐻 Bear Models: What Each Key Unlocks

| Key Added | Feature Unlocked | Demo Experience |
|-----------|-----------------|-----------------|
| **Only CoinGecko** | 🟢 **Live prices + dip alerts** | **MVP CORE** - Dashboard works! |
| **+ Sentry** | 🟢 **Crash reports** | Bugs auto-tracked |
| **+ Grok** | 🟢 **AI TradeWhisperer** | "DIP! SNIPE NOW!" chat |
| **+ RevenueCat** | 🟢 **Premium gating** | Unlimited sims ($4.99) |

---

## 🎮 Demo Mode (No Keys Required)

Add this to test **WITHOUT ANY KEYS**:

```env
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_USE_MOCK_PRICES=true
```

**Gives you:**
- Mock prices (IBIT=$85.23, ETHA=$3200)
- Fake dips every 30 seconds
- Local meme responses ("HODL YOU BEAUTIFUL BEAST!")
- **Perfect for coding + demos**

---

## 💰 Cost Breakdown

| Phase | Keys Active | Monthly Cost |
|-------|-------------|--------------|
| **Phase 1 (MVP)** | CoinGecko + Sentry | **$0** |
| **Phase 2 (AI)** | + Grok API | **$5-20** |
| **Phase 3 (Premium)** | + RevenueCat | **$0** (first 10K users) |
| **Total Launch** | All 4 | **$5-20/mo** |

---

## 🚀 MVP Minimum (Start Coding Now)

**You need ONLY:**

```env
COINGECKO_API_KEY=CG-YOUR-KEY-HERE
SENTRY_DSN=https://your-sentry-dsn-here
GROK_API_KEY=dummy_local_fallback
```

**That's it!** 10 minutes → **FULLY FUNCTIONAL DASHBOARD**

---

## 🐾 CoinGecko Attribution (MANDATORY for Demo Plan)

CoinGecko requires visible attribution for all price data. Slap that logo like a bear paw on fresh salmon! 🐻🐟

### Text + Logo Examples

- **Simple Footer**: "Price data by [CoinGecko](https://www.coingecko.com)"
- **With Logo**: CoinGecko logo (SVG from [brand kit](https://brand.coingecko.com/brand-kit)) hyperlinked to coingecko.com, plus "Powered by CoinGecko API".

### React Native Implementation

```tsx
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

export const CoinGeckoAttribution = () => (
  <TouchableOpacity 
    onPress={() => Linking.openURL('https://www.coingecko.com?utm_source=bearbargain&utm_medium=app')}
    style={styles.container}
  >
    <Image 
      source={{ uri: 'https://static.coingecko.com/s/coingecko-branding-guide-8447de673439420efa0ab1e0e03a1f8b0137c3f142f84f5f2685a7ae3e1c31b2.png' }} 
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.text}>Data powered by CoinGecko</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  logo: { width: 24, height: 24, marginRight: 8 },
  text: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#888' },
});
```

### Placement Rules

| Location | When to Use |
|----------|-------------|
| **Dashboard Footer** | Always visible (recommended) |
| **Price Cards** | On each ETF card badge |
| **Settings > Credits** | Full attribution + links |

### UTM Tracking (Optional)

Add `?utm_source=bearbargain&utm_medium=app` for analytics love back to CoinGecko.

### ⚠️ Demo Plan Warning

**Attribution = your free pass.** Skip it? Potential API throttle or key revocation. Keep it visible, keep it clean—sans-serif font, no distortion, hyperlinked.

**Phase 2 upgrade?** Same rules apply. CoinGecko loves the love.

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `"Invalid API key"` | Wrong CoinGecko key | Re-copy from dashboard → paste in `.env` |
| `"Rate limit exceeded"` | >10K calls/month | Upgrade to Pro ($129/mo) or add caching |
| `"Network error"` | Key not loaded | Check `.env` file exists + restart Metro |
| `"Sentry not tracking"` | Wrong DSN format | Must start with `https://` |
| `"AI responses empty"` | Grok key invalid | Use `dummy_local_fallback` for Phase 1 |

---

## 🎯 Quick Links

| Service | Dashboard | Docs |
|---------|-----------|------|
| **CoinGecko** | [coingecko.com/en/api](https://www.coingecko.com/en/api) | [docs.coingecko.com](https://docs.coingecko.com/) |
| **Sentry** | [sentry.io](https://sentry.io) | [docs.sentry.io/react-native](https://docs.sentry.io/platforms/react-native/) |
| **Grok/xAI** | [console.x.ai](https://console.x.ai/) | [docs.x.ai](https://docs.x.ai/) |
| **RevenueCat** | [app.revenuecat.com](https://app.revenuecat.com) | [docs.revenuecat.com](https://docs.revenuecat.com/) |

---

## ✅ Your Next 3 Steps

1. **Get CoinGecko key** (5 min): https://www.coingecko.com/en/api
2. **Get Sentry DSN** (5 min): https://sentry.io/signup/
3. **Create .env file** → Paste keys → `npx expo start`

**Your app will be live in 15 minutes!** 🐻🚀
