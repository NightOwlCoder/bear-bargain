import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DipAlert } from '../types/schemas';
import { COLORS, GRADIENTS } from '../constants/colors';
import { AnimationConfig } from '../utils/featureFlags';
import { useAnimationPool } from '../providers/AnimationProvider';

export type DipAlertBannerProps = {
  alert: DipAlert;
  onDismiss?: () => void;
};

// 🐻 AI-GENERATED BEAR CLAW SVG - LEFT PAW
const BearClawLeft = () => (
  <Svg width="100" height="80" viewBox="0 0 100 80">
    <G>
      {/* Main paw pad */}
      <Path
        d="M15 55 Q20 35 40 40 Q60 45 70 30 Q75 15 60 10 Q40 5 25 20 Q10 35 15 55 Z"
        fill="#D97706"
        stroke="#92400E"
        strokeWidth="3"
      />
      {/* Toe pads */}
      <Circle cx="30" cy="22" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <Circle cx="50" cy="18" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <Circle cx="65" cy="28" r="9" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      {/* Sharp claws */}
      <Path d="M25 12 L18 2 L22 12" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      <Path d="M45 8 L42 -4 L48 8" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      <Path d="M62 15 L68 4 L70 18" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      {/* Main pad center */}
      <Path
        d="M30 50 Q35 40 50 45 Q60 50 55 58 Q45 65 35 60 Q28 55 30 50 Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="2"
      />
    </G>
  </Svg>
);

// 🐻 AI-GENERATED BEAR CLAW SVG - RIGHT PAW
const BearClawRight = () => (
  <Svg width="100" height="80" viewBox="0 0 100 80">
    <G>
      {/* Main paw pad */}
      <Path
        d="M85 55 Q80 35 60 40 Q40 45 30 30 Q25 15 40 10 Q60 5 75 20 Q90 35 85 55 Z"
        fill="#D97706"
        stroke="#92400E"
        strokeWidth="3"
      />
      {/* Toe pads */}
      <Circle cx="70" cy="22" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <Circle cx="50" cy="18" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <Circle cx="35" cy="28" r="9" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      {/* Sharp claws */}
      <Path d="M75 12 L82 2 L78 12" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      <Path d="M55 8 L58 -4 L52 8" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      <Path d="M38 15 L32 4 L30 18" fill="#1F2937" stroke="#111827" strokeWidth="1" />
      {/* Main pad center */}
      <Path
        d="M70 50 Q65 40 50 45 Q40 50 45 58 Q55 65 65 60 Q72 55 70 50 Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="2"
      />
    </G>
  </Svg>
);

// 🐻 BEAR ROAR: Multiple haptic patterns
const triggerBearRoar = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 50);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 150);
    console.log('🐻 BEAR ROAR: Haptic feedback triggered!');
  } catch (err) {
    console.warn('🐻 Haptics unavailable:', err);
  }
};

// 🔊 Play audio roar with haptic fallback
const playBearRoarAudio = async (): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../assets/sounds/bear-roar.mp3'),
      { shouldPlay: true, volume: 0.8 }
    );
    await sound.playAsync();
    console.log('🔊 BEAR ROAR: Audio playing!');
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('🐻 Audio unavailable, haptic fallback active');
  }
};

export const DipAlertBanner: React.FC<DipAlertBannerProps> = ({ alert, onDismiss }) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Banner animation values
  const bannerTranslateX = useSharedValue(400);
  const bannerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.8);

  // LEFT CLAW animation - starts visible at position 50
  const clawLeftTranslateX = useSharedValue(50);
  const clawLeftRotate = useSharedValue(0);
  const clawLeftOpacity = useSharedValue(1); // VISIBLE

  // RIGHT CLAW animation - starts visible at position 150
  const clawRightTranslateX = useSharedValue(150);
  const clawRightRotate = useSharedValue(0);
  const clawRightOpacity = useSharedValue(1); // VISIBLE

  const { requestSlot, staggerDelay } = useAnimationPool();

  useEffect(() => {
    const slot = requestSlot();
    const baseDelay = slot ? staggerDelay(slot.index) : 0;

    // ========== 1. BANNER SLIDE IN ==========
    bannerOpacity.value = withDelay(baseDelay, withTiming(1, { duration: 250 }));
    bannerScale.value = withDelay(baseDelay, withSpring(1, { damping: 14, stiffness: 180 }));
    bannerTranslateX.value = withDelay(
      baseDelay,
      withSpring(0, { damping: 18, stiffness: 120, mass: 1 })
    );

    // ========== 2. HAPTIC + AUDIO (IMMEDIATE) ==========
    if (Platform.OS !== 'web') {
      triggerBearRoar();
      playBearRoarAudio();
    }

    // ========== 3. LEFT CLAW BOUNCE (simple wobble animation) ==========
    clawLeftRotate.value = withSequence(
      withSpring(-20, { damping: 4, stiffness: 200 }),
      withSpring(20, { damping: 4, stiffness: 200 }),
      withSpring(-10, { damping: 6, stiffness: 200 }),
      withSpring(0, { damping: 8, stiffness: 200 })
    );
    clawLeftTranslateX.value = withSequence(
      withSpring(30, { damping: 8, stiffness: 150 }),
      withSpring(100, { damping: 8, stiffness: 150 }),
      withSpring(50, { damping: 10, stiffness: 150 })
    );

    // ========== 4. RIGHT CLAW BOUNCE (staggered) ==========
    clawRightRotate.value = withDelay(
      200,
      withSequence(
        withSpring(20, { damping: 4, stiffness: 200 }),
        withSpring(-20, { damping: 4, stiffness: 200 }),
        withSpring(10, { damping: 6, stiffness: 200 }),
        withSpring(0, { damping: 8, stiffness: 200 })
      )
    );
    clawRightTranslateX.value = withDelay(
      200,
      withSequence(
        withSpring(130, { damping: 8, stiffness: 150 }),
        withSpring(200, { damping: 8, stiffness: 150 }),
        withSpring(150, { damping: 10, stiffness: 150 })
      )
    );

    // ========== 5. FADE OUT CLAWS after 3 seconds ==========
    clawLeftOpacity.value = withDelay(3000, withTiming(0, { duration: 500 }));
    clawRightOpacity.value = withDelay(3000, withTiming(0, { duration: 500 }));

    // ========== 6. AUTO-DISMISS after TTL ==========
    const dismissTimer = setTimeout(() => {
      bannerOpacity.value = withTiming(0, { duration: 400 });
      bannerScale.value = withTiming(0.85, { duration: 400 });
      bannerTranslateX.value = withTiming(300, { duration: 400 });
      setTimeout(() => onDismiss?.(), 400);
    }, AnimationConfig.alertTtlMs);

    return () => {
      clearTimeout(dismissTimer);
      soundRef.current?.unloadAsync();
    };
  }, [
    alert.id,
    bannerOpacity,
    bannerScale,
    bannerTranslateX,
    clawLeftOpacity,
    clawLeftRotate,
    clawLeftTranslateX,
    clawRightOpacity,
    clawRightRotate,
    clawRightTranslateX,
    onDismiss,
    requestSlot,
    staggerDelay,
  ]);

  // BANNER animated style
  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateX: bannerTranslateX.value }, { scale: bannerScale.value }],
  }));

  // LEFT CLAW animated style
  const clawLeftStyle = useAnimatedStyle(() => ({
    opacity: clawLeftOpacity.value,
    transform: [
      { translateX: clawLeftTranslateX.value },
      { rotate: `${clawLeftRotate.value}deg` },
    ],
  }));

  // RIGHT CLAW animated style
  const clawRightStyle = useAnimatedStyle(() => ({
    opacity: clawRightOpacity.value,
    transform: [
      { translateX: clawRightTranslateX.value },
      { rotate: `${clawRightRotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* 🐻 LEFT BEAR CLAW (swipes left → right) */}
      <Animated.View style={[styles.clawContainerLeft, clawLeftStyle]}>
        <BearClawLeft />
      </Animated.View>

      {/* 🐻 RIGHT BEAR CLAW (swipes right → left) */}
      <Animated.View style={[styles.clawContainerRight, clawRightStyle]}>
        <BearClawRight />
      </Animated.View>

      {/* BANNER */}
      <Animated.View style={[styles.banner, bannerStyle]}>
        <LinearGradient colors={GRADIENTS.dipAlert} style={styles.gradient}>
          {/* DIP INFO */}
          <View style={styles.textContent}>
            <Text style={styles.badge}>🐻 {alert.dipPercentage.toFixed(1)}% DIP!</Text>
            <Text style={styles.symbol}>{alert.symbol}</Text>
            <Text style={styles.price}>${alert.price.toFixed(2)}</Text>
            <Text style={styles.cta}>🎯 SNIPE NOW!</Text>
          </View>

        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  banner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'visible', // Allow claws to overflow
    elevation: 10,
    shadowColor: COLORS.lossRed,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 1000,
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
  },
  textContent: {
    flex: 1,
  },
  badge: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  symbol: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  price: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  cta: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  clawContainerLeft: {
    position: 'absolute',
    top: 30,  // Near the banner top (banner is at top: 60)
    left: 0,  // Start at left edge
    zIndex: 1001,
  },
  clawContainerRight: {
    position: 'absolute',
    top: 50,  // Slightly lower for stagger effect
    left: 0,  // Also start from left side
    zIndex: 1001,
  },
  clawShadow: {
    shadowColor: '#92400E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
  },
  clawIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default DipAlertBanner;
