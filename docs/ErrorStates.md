# 🚨 BearBargain Error States

**Version 1.0** - 3 error states with bear-themed UI. All errors include "Bear Growl Warning" styling from `LegalDisclaimers.md`.

---

## 🐾 Error State Matrix

| State | Trigger | UI Component | Animation | User Action | Auto-Retry |
|-------|---------|-------------|-----------|-------------|------------|
| **NETWORK_ERROR** | WS disconnect, no internet | **Bear Nap Modal** | Fade-in cave, Zzz float | Retry button + use cached | Yes (3x, 3s backoff) |
| **API_ERROR** | Grok/CoinGecko 429/500 | **Claw Retry Sheet** | Claw swipe → pulse | Wait or manual retry | Yes (3s, 6s, 12s) |
| **STALE_DATA** | Prices >5min old | **Hunt Again Banner** | Salmon swim animation | Tap to refresh | No |

---

## 1. Bear Nap Modal (NETWORK_ERROR)

**Trigger**: WebSocket disconnect, `navigator.onLine === false`, fetch timeout >10s

**Display**: Full-screen modal, non-dismissable until connection restored

```
┌────────────────────────────────────────────┐
│                                            │
│          ┌─────────────────────┐           │
│          │                     │           │
│          │    🐻💤             │           │
│          │    Zzz...           │           │
│          │                     │           │
│          └─────────────────────┘           │
│                                            │
│       Bear's Hibernating 😴                │
│                                            │
│   No internet connection detected.         │
│   Using cached dips from 5 min ago.        │
│                                            │
│   ┌──────────────────────────────────────┐ │
│   │         WAKE BEAR UP 🐾              │ │
│   └──────────────────────────────────────┘ │
│                                            │
│   🐻 Cached data may not reflect current   │
│   prices. Trade carefully!                 │
│                                            │
└────────────────────────────────────────────┘
```

### Implementation

```typescript
// components/BearNapModal.tsx
import { Modal, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';

interface BearNapModalProps {
  visible: boolean;
  cachedDataAge: number; // minutes
  onRetry: () => void;
}

export const BearNapModal = ({ visible, cachedDataAge, onRetry }: BearNapModalProps) => {
  // Zzz floating animation
  const zzzY = useSharedValue(0);
  
  React.useEffect(() => {
    zzzY.value = withRepeat(
      withTiming(-10, { duration: 1500 }),
      -1, // infinite
      true // reverse
    );
  }, []);
  
  const zzzStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: zzzY.value }],
  }));
  
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <LinearGradient 
        colors={['#8B4513', '#1A5C38']} 
        style={styles.container}
      >
        <View style={styles.cave}>
          <Text style={styles.bearEmoji}>🐻</Text>
          <Animated.Text style={[styles.zzz, zzzStyle]}>💤 Zzz...</Animated.Text>
        </View>
        
        <Text style={styles.title}>Bear's Hibernating 😴</Text>
        <Text style={styles.message}>
          No internet connection detected.{'\n'}
          Using cached dips from {cachedDataAge} min ago.
        </Text>
        
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>WAKE BEAR UP 🐾</Text>
        </Pressable>
        
        <Text style={styles.disclaimer}>
          🐻 Cached data may not reflect current prices. Trade carefully!
        </Text>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cave: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  bearEmoji: { fontSize: 64 },
  zzz: { 
    fontSize: 24, 
    color: '#D4AF37',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#1A5C38',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 24,
  },
});
```

### Retry Logic

```typescript
// hooks/useNetworkRetry.ts
const MAX_RETRIES = 3;
const BACKOFF_MS = [3000, 6000, 12000]; // Exponential backoff

export const useNetworkRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retry = async (reconnectFn: () => Promise<boolean>) => {
    if (retryCount >= MAX_RETRIES) {
      // Give up, stay on cached data
      return false;
    }
    
    setIsRetrying(true);
    
    // Wait with backoff
    await sleep(BACKOFF_MS[retryCount]);
    
    const success = await reconnectFn();
    
    if (success) {
      setRetryCount(0);
      setIsRetrying(false);
      return true;
    }
    
    setRetryCount(prev => prev + 1);
    setIsRetrying(false);
    return false;
  };
  
  return { retry, retryCount, isRetrying, maxRetries: MAX_RETRIES };
};
```

---

## 2. Claw Retry Sheet (API_ERROR)

**Trigger**: CoinGecko 429 (rate limit), Grok 500/503, any API timeout

**Display**: Bottom sheet, dismissable after showing retry progress

```
┌────────────────────────────────────────────┐
│                                            │
│  ╭──────────────────────────────────────╮  │
│  │                                      │  │
│  │     🐻🦴  API taking a nap...        │  │
│  │                                      │  │
│  │     ████████░░░░░░  Retrying in 3s   │  │
│  │                                      │  │
│  │     [RETRY NOW]     [USE CACHED]     │  │
│  │                                      │  │
│  ╰──────────────────────────────────────╯  │
│                                            │
└────────────────────────────────────────────┘
```

### Implementation

```typescript
// components/ClawRetrySheet.tsx
import BottomSheet from '@gorhom/bottom-sheet';
import { Progress } from 'react-native-progress';

interface ClawRetrySheetProps {
  visible: boolean;
  errorType: 'rate_limit' | 'server_error' | 'timeout';
  retryInSeconds: number;
  onRetryNow: () => void;
  onUseCached: () => void;
}

export const ClawRetrySheet = ({
  visible,
  errorType,
  retryInSeconds,
  onRetryNow,
  onUseCached,
}: ClawRetrySheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [countdown, setCountdown] = useState(retryInSeconds);
  
  // Claw swipe animation
  const clawX = useSharedValue(-50);
  
  useEffect(() => {
    clawX.value = withRepeat(
      withTiming(50, { duration: 500 }),
      3, // 3 swipes
      true
    );
  }, [visible]);
  
  const clawStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: clawX.value }],
  }));
  
  // Countdown timer
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRetryNow();
          return retryInSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [visible, retryInSeconds]);
  
  const errorMessages = {
    rate_limit: "Too many requests! CoinGecko needs a breather.",
    server_error: "Grok's servers are having a moment.",
    timeout: "Request took too long. Network might be slow.",
  };
  
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={['30%']}
      backgroundStyle={{ backgroundColor: '#1A5C38' }}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.claw, clawStyle]}>🐻🦴</Animated.Text>
        
        <Text style={styles.title}>API taking a nap...</Text>
        <Text style={styles.message}>{errorMessages[errorType]}</Text>
        
        <View style={styles.progressContainer}>
          <Progress.Bar 
            progress={(retryInSeconds - countdown) / retryInSeconds}
            width={200}
            color="#D4AF37"
            unfilledColor="rgba(255,255,255,0.2)"
          />
          <Text style={styles.countdown}>Retrying in {countdown}s</Text>
        </View>
        
        <View style={styles.buttons}>
          <Pressable style={styles.retryButton} onPress={onRetryNow}>
            <Text style={styles.buttonText}>RETRY NOW</Text>
          </Pressable>
          <Pressable style={styles.cachedButton} onPress={onUseCached}>
            <Text style={styles.buttonText}>USE CACHED</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};
```

---

## 3. Hunt Again Banner (STALE_DATA)

**Trigger**: Price data timestamp > 5 minutes old

**Display**: Top banner, auto-hides on successful refresh

```
┌────────────────────────────────────────────┐
│  🐟 Prices a bit stale. Hunting fresh...  │
│      [TAP TO REFRESH]                      │
└────────────────────────────────────────────┘
```

### Implementation

```typescript
// components/HuntAgainBanner.tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface HuntAgainBannerProps {
  visible: boolean;
  staleMinutes: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const HuntAgainBanner = ({
  visible,
  staleMinutes,
  onRefresh,
  isRefreshing,
}: HuntAgainBannerProps) => {
  // Salmon swim animation
  const salmonX = useSharedValue(0);
  
  useEffect(() => {
    salmonX.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 300 }),
        withTiming(-10, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1, // infinite
      false
    );
  }, []);
  
  const salmonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: salmonX.value }],
  }));
  
  if (!visible) return null;
  
  return (
    <Pressable onPress={onRefresh} disabled={isRefreshing}>
      <LinearGradient
        colors={['rgba(139, 69, 19, 0.95)', 'rgba(139, 69, 19, 0.8)']}
        style={styles.banner}
      >
        <Animated.Text style={[styles.salmon, salmonStyle]}>🐟</Animated.Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>
            Prices are {staleMinutes}min old. Hunting fresh dips...
          </Text>
          {!isRefreshing && (
            <Text style={styles.cta}>TAP TO REFRESH</Text>
          )}
          {isRefreshing && (
            <ActivityIndicator color="#D4AF37" size="small" />
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  salmon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  cta: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '700',
    marginTop: 4,
  },
});
```

---

## 🛡️ Error Handling Hook

Central hook that manages all error states:

```typescript
// hooks/useErrorBoundary.ts
type ErrorState = 'idle' | 'network_error' | 'api_error' | 'stale_data';

interface ErrorBoundaryState {
  state: ErrorState;
  apiErrorType?: 'rate_limit' | 'server_error' | 'timeout';
  staleMinutes?: number;
  cachedDataAvailable: boolean;
}

export const useErrorBoundary = () => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    state: 'idle',
    cachedDataAvailable: false,
  });
  
  const handleNetworkError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      state: 'network_error',
      cachedDataAvailable: hasCachedData(),
    }));
    
    // Log to Sentry
    Sentry.captureMessage('Network error detected', 'warning');
  }, []);
  
  const handleApiError = useCallback((status: number, endpoint: string) => {
    let errorType: 'rate_limit' | 'server_error' | 'timeout' = 'server_error';
    
    if (status === 429) errorType = 'rate_limit';
    else if (status === 0) errorType = 'timeout';
    
    setErrorState(prev => ({
      ...prev,
      state: 'api_error',
      apiErrorType: errorType,
    }));
    
    // Log to Sentry with context
    Sentry.captureException(new Error(`API Error: ${status}`), {
      tags: { endpoint, errorType },
    });
  }, []);
  
  const handleStaleData = useCallback((lastUpdated: number) => {
    const staleMinutes = Math.floor((Date.now() - lastUpdated) / 60000);
    
    if (staleMinutes >= 5) {
      setErrorState(prev => ({
        ...prev,
        state: 'stale_data',
        staleMinutes,
      }));
    }
  }, []);
  
  const clearError = useCallback(() => {
    setErrorState({ state: 'idle', cachedDataAvailable: false });
  }, []);
  
  return {
    errorState,
    handleNetworkError,
    handleApiError,
    handleStaleData,
    clearError,
  };
};
```

---

## 📊 Error Metrics (Sentry)

Track error rates to catch regressions:

| Error Type | Target Rate | Alert Threshold | Action |
|-----------|-------------|-----------------|--------|
| `NETWORK_ERROR` | <5% sessions | >10% | PagerDuty alert |
| `API_ERROR` | <2% requests | >5% | Slack notification |
| `STALE_DATA` | <10% sessions | >20% | Email to team |

### Sentry Configuration

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.2,
  beforeSend(event) {
    // Don't send expected errors in dev
    if (__DEV__ && event.level === 'warning') {
      return null;
    }
    return event;
  },
});

// Custom error tracking
export const trackError = (
  type: 'network' | 'api' | 'stale',
  context: Record<string, any>
) => {
  Sentry.setTag('error_type', type);
  Sentry.setContext('error_details', context);
};
```

---

## 🔗 Integration with Legal Disclaimers

All error UI includes the "Bear Growl Warning" styling from `LegalDisclaimers.md`:

- Brown bubble background (`#8B4513`)
- Claw border decoration (dashed gold border)
- 12px caption font for disclaimer text
- Bear paw icon prefix on warnings

```typescript
// Shared disclaimer component for errors
const ErrorDisclaimer = ({ message }: { message: string }) => (
  <View style={styles.disclaimerContainer}>
    <Text style={styles.disclaimerText}>🐻 {message}</Text>
  </View>
);

// Used in all error components:
<ErrorDisclaimer message="Cached data may not reflect current prices." />
```

---

## ✅ Testing Checklist

### Network Error
- [ ] Disconnect WiFi → Bear Nap Modal appears
- [ ] Shows cached data age correctly
- [ ] "Wake Bear Up" triggers retry
- [ ] Auto-retries 3x with backoff (3s, 6s, 12s)
- [ ] After 3 failures, stays on cached data

### API Error
- [ ] CoinGecko 429 → Claw Retry Sheet shows "rate limit"
- [ ] Grok 500 → Shows "server error"
- [ ] Timeout → Shows "timeout"
- [ ] Progress bar counts down correctly
- [ ] "Retry Now" triggers immediate retry
- [ ] "Use Cached" dismisses sheet

### Stale Data
- [ ] Data >5min old → Hunt Again Banner appears
- [ ] Salmon swims in animation
- [ ] Tap triggers refresh
- [ ] Banner hides on successful refresh
- [ ] Shows correct stale minutes
