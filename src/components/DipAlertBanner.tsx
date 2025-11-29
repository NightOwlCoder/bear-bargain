import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DipAlert } from '../types/schemas';
import { COLORS, GRADIENTS } from '../constants/colors';
import { AnimationConfig } from '../utils/featureFlags';
import { useAnimationPool } from '../providers/AnimationProvider';

export type DipAlertBannerProps = {
  alert: DipAlert;
  onDismiss?: () => void;
};

const triggerHaptic = () =>
  Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Heavy).catch((err) =>
    console.warn('Haptics unavailable', err),
  );

export const DipAlertBanner: React.FC<DipAlertBannerProps> = ({ alert, onDismiss }) => {
  const translateX = useSharedValue(200);
  const clawSwipe = useSharedValue(-120);
  const { requestSlot, staggerDelay } = useAnimationPool();

  useEffect(() => {
    const slot = requestSlot();
    const delay = slot ? staggerDelay(slot.index) : 0;
    translateX.value = withDelay(delay, withTiming(0, { duration: 300 }));
    clawSwipe.value = withSequence(
      withSpring(-100, { damping: 12 }),
      withTiming(0, { duration: 150 }),
      withSpring(50, { damping: 8 }),
    );

    triggerHaptic();
    const timer = setTimeout(() => onDismiss?.(), AnimationConfig.alertTtlMs);
    return () => clearTimeout(timer);
  }, [clawSwipe, onDismiss, requestSlot, staggerDelay, translateX]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const clawStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: clawSwipe.value }],
  }));

  return (
    <Animated.View style={[styles.banner, containerStyle]}>
      <LinearGradient colors={GRADIENTS.dipAlert} style={styles.gradient}>
        <View style={styles.textContent}>
          <Text style={styles.badge}>🐾 {alert.dipPercentage.toFixed(1)}% DIP!</Text>
          <Text style={styles.symbol}>{alert.symbol}</Text>
          <Text style={styles.price}>${alert.price.toFixed(2)}</Text>
        </View>
        <Animated.View style={[styles.clawOverlay, clawStyle]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 32,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.lossRed,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  gradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  badge: {
    color: COLORS.lossRed,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  symbol: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  price: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  clawOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: -120,
    width: 160,
    backgroundColor: COLORS.dipSplash,
  },
});

export default DipAlertBanner;
