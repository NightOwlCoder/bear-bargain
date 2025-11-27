/**
 * 🐻 BearBargain Feature Flags
 * Centralized feature management from docs/Architecture.md
 */

// Environment-based flags
const env = (key: string, fallback: string = '') => 
  process.env[`EXPO_PUBLIC_${key}`] ?? fallback;

const envBool = (key: string, fallback: boolean = false) =>
  env(key, String(fallback)) === 'true';

const envNumber = (key: string, fallback: number) =>
  Number(env(key, String(fallback))) || fallback;

// ================================
// FEATURE FLAGS
// ================================

export const FeatureFlags = {
  // Demo/Development Mode
  useMockPrices: envBool('USE_MOCK_PRICES', false),
  demoMode: envBool('DEMO_MODE', false),
  bypassPaywall: envBool('BYPASS_PAYWALL', false),
  
  // Premium Features (RevenueCat)
  premiumEnabled: envBool('PREMIUM_ENABLED', true),
  
  // App Configuration
  appVersion: env('APP_VERSION', '1.0.0'),
} as const;

// ================================
// ANIMATION CONFIG
// ================================

export const AnimationConfig = {
  maxConcurrentAnims: envNumber('MAX_CONCURRENT_ANIMS', 5),
  staggerDelayMs: envNumber('STAGGER_DELAY_MS', 32),
  
  // Spring configuration (v0 iOS style)
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Alert timing
  alertTtlMs: envNumber('ALERT_TTL_MS', 5000),
} as const;

// ================================
// DIP DETECTION CONFIG
// ================================

export const DipConfig = {
  defaultThreshold: envNumber('DEFAULT_DIP_THRESHOLD', 10),
  wsThrottleMs: envNumber('WS_THROTTLE_MS', 1000),
  staleCacheMinutes: 5,
  maxQueuedActions: 10,
} as const;

// ================================
// BEAR AUDIO CONFIG
// ================================

export const AudioConfig = {
  bearRoarVolume: envNumber('BEAR_ROAR_VOLUME', 0.8),
  dipAlertVibration: envBool('DIP_ALERT_VIBRATION', true),
} as const;

// ================================
// PREMIUM CHECK
// ================================

// TODO: Replace with RevenueCat in Phase 2
export const isPremium = (): boolean => {
  if (FeatureFlags.bypassPaywall) return true;
  // RevenueCat integration here
  return false;
};

// ================================
// DEBUG HELPERS
// ================================

export const debugFlags = () => {
  if (__DEV__) {
    console.log('🐻 BearBargain Feature Flags:', {
      ...FeatureFlags,
      animation: AnimationConfig,
      dip: DipConfig,
      audio: AudioConfig,
    });
  }
};
