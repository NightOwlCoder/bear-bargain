# 🛠️ BearBargain Environment Setup

**Version 1.0** - Get running in 10 minutes.

---

## 🔑 API Keys Required

| Service | Key Name | Free Tier? | Setup Link |
|---------|----------|------------|------------|
| **CoinGecko** | `COINGECKO_API_KEY` | ✅ Yes (10K calls/mo) | [coingecko.com/en/api](https://www.coingecko.com/en/api) |
| **Grok API** | `GROK_API_KEY` | ❌ Paid | [x.ai/api](https://x.ai/api) |
| **Sentry** | `SENTRY_DSN` | ✅ Yes (5K errors/mo) | [sentry.io](https://sentry.io) |
| **RevenueCat** | `REVENUECAT_API_KEY` | ✅ Free tier | [revenuecat.com](https://revenuecat.com) |

---

## 📝 Environment Variables

### `.env.example` Template

```env
# ================================
# BEARBARGAIN ENVIRONMENT CONFIG
# ================================

# API Keys (REQUIRED)
COINGECKO_API_KEY=your_coingecko_key_here
GROK_API_KEY=your_grok_key_here

# Error Tracking (RECOMMENDED)
SENTRY_DSN=your_sentry_dsn_here

# Monetization (OPTIONAL for Phase 1)
REVENUECAT_API_KEY=your_revenuecat_key_here

# ================================
# APP CONFIGURATION
# ================================

# Feature Flags
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_PREMIUM_ENABLED=true
EXPO_PUBLIC_DEMO_MODE=false

# Dip Detection Defaults
EXPO_PUBLIC_DEFAULT_DIP_THRESHOLD=10
EXPO_PUBLIC_WS_THROTTLE_MS=1000
EXPO_PUBLIC_ALERT_TTL_MS=5000

# Animation Config
EXPO_PUBLIC_MAX_CONCURRENT_ANIMS=5
EXPO_PUBLIC_STAGGER_DELAY_MS=32

# Bear Sounds 🐻
EXPO_PUBLIC_BEAR_ROAR_VOLUME=0.8
EXPO_PUBLIC_DIP_ALERT_VIBRATION=true

# ================================
# DEVELOPMENT OVERRIDES
# ================================

# Set to true for keyless testing with mock data
EXPO_PUBLIC_USE_MOCK_PRICES=false

# Set to true to bypass premium checks
EXPO_PUBLIC_BYPASS_PAYWALL=false
```

### Setup Instructions

```bash
# 1. Copy template
cp .env.example .env

# 2. Edit with your keys
nano .env  # or use your editor

# 3. Verify (should show your keys)
cat .env | grep API_KEY
```

---

## 🚀 Quick Start Commands

```bash
# ================================
# INITIAL SETUP
# ================================

# 1. Clone repository
git clone https://github.com/NightOwlCoder/bear-bargain.git
cd bear-bargain

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env
# Edit .env with your API keys

# ================================
# DEVELOPMENT
# ================================

# iOS Simulator (recommended for development)
npx expo run:ios

# iOS Device (requires provisioning)
npx expo run:ios --device

# Start Metro bundler only
npx expo start

# Clear cache and restart
npx expo start --clear

# ================================
# PRODUCTION BUILDS
# ================================

# Install EAS CLI (first time only)
npm install -g @expo/eas-cli

# Login to Expo account
eas login

# Build iOS preview (Ad Hoc distribution)
eas build --platform ios --profile preview

# Build iOS production (App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🔧 Expo Configuration

### `app.json` (Key Sections)

```json
{
  "expo": {
    "name": "BearBargain",
    "slug": "bearbargain",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A5C38"
    },
    "platforms": ["ios"],
    "ios": {
      "supportsTablet": false,
      "deploymentTarget": "14.0",
      "bundleIdentifier": "com.nightowlcoder.bearbargain",
      "buildNumber": "1",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "BearBargain uses the microphone for voice commands with TradeWhisperer AI.",
        "NSSpeechRecognitionUsageDescription": "BearBargain uses speech recognition to convert your voice to text."
      }
    },
    "plugins": [
      [
        "react-native-reanimated/plugin",
        {
          "processNestedWorklets": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#1A5C38",
          "sounds": ["./assets/sounds/bear-growl.wav"]
        }
      ],
      "expo-speech"
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id-here"
      }
    }
  }
}
```

### `eas.json` (Build Profiles)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      }
    }
  }
}
```

---

## 📦 Required Dependencies

### Core Dependencies

```bash
npm install \
  react-native-reanimated \
  @tanstack/react-query \
  zod \
  zustand \
  @react-native-async-storage/async-storage
```

### UI & Animations

```bash
npm install \
  expo-linear-gradient \
  @gorhom/bottom-sheet \
  react-native-gesture-handler
```

### Voice & Audio

```bash
npm install \
  expo-speech \
  expo-av
```

### Push Notifications

```bash
npm install \
  expo-notifications \
  expo-device
```

### Premium (Optional)

```bash
npm install \
  react-native-purchases
```

### Dev Dependencies

```bash
npm install --save-dev \
  @types/react \
  typescript
```

### Full Install Command

```bash
npm install react-native-reanimated @tanstack/react-query zod zustand @react-native-async-storage/async-storage expo-linear-gradient @gorhom/bottom-sheet react-native-gesture-handler expo-speech expo-av expo-notifications expo-device

npm install --save-dev @types/react typescript
```

---

## 🔌 Babel Configuration

### `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
```

---

## ✅ Verification Checklist

Run through these after setup to confirm everything works:

### Environment

- [ ] `.env` file created with all required keys
- [ ] `COINGECKO_API_KEY` is valid (test: `curl "https://api.coingecko.com/api/v3/ping"`)
- [ ] `GROK_API_KEY` is valid (or `EXPO_PUBLIC_USE_MOCK_PRICES=true`)

### Build

- [ ] `npm install` completes without errors
- [ ] `npx expo run:ios` starts simulator
- [ ] App loads without red error screen
- [ ] No Zod validation errors in Metro console

### Features

- [ ] Dashboard shows ETF cards (mock or real prices)
- [ ] Manually trigger dip (edit mock price to -12%)
- [ ] Console logs "DIP DETECTED! 🐻📉"
- [ ] TradeConfirmPopup opens on alert tap
- [ ] Settings screen loads

### Animations

- [ ] ETF cards have spring bounce on tap
- [ ] Alert fades in with stagger
- [ ] No frame drops on iPhone 11+ (60fps)

---

## 🐻 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `"Invalid API key"` | Wrong CoinGecko key | Re-copy from dashboard → paste in `.env` |
| `"Reanimated worklet error"` | Missing babel plugin | Add to `babel.config.js`, clear cache: `npx expo start --clear` |
| `"WebSocket connection failed"` | CoinGecko rate limit | Set `EXPO_PUBLIC_USE_MOCK_PRICES=true` for dev |
| `"Animations laggy"` | Too many concurrent | Test on iPhone 11+ (iOS 14+) |
| `"Metro bundler stuck"` | Cache corruption | `npx expo start --clear` |
| `"EAS build failed"` | Missing credentials | Run `eas credentials` to configure |
| `"Push notifications not working"` | Missing permissions | Check `infoPlist` in app.json |

---

## 🎮 Demo Mode

For testing without API keys:

```env
# .env
EXPO_PUBLIC_USE_MOCK_PRICES=true
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_BYPASS_PAYWALL=true
```

This enables:
- Mock price data (BTC: $95K, ETH: $3.5K)
- Fake dip alerts every 30s
- All premium features unlocked
- Local AI responses (no Grok needed)

---

## 📱 Device Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **iOS Version** | 14.0 | 17.0+ |
| **iPhone Model** | iPhone 11 | iPhone 13+ |
| **Storage** | 100MB | 200MB |
| **RAM** | 3GB | 4GB+ |

**Note:** Older devices (iPhone X, 8) may experience animation jank. Set `EXPO_PUBLIC_MAX_CONCURRENT_ANIMS=3` for better performance.
