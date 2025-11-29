import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DipAlert } from '../types/schemas';
import { COLORS, GRADIENTS } from '../constants/colors';
import { AnimationConfig } from '../utils/featureFlags';
import { useAnimationPool } from '../providers/AnimationProvider';

interface Props {
  alert: DipAlert;
  onDismiss: () => void;
}

const DipAlertBanner: React.FC<Props> = ({ alert, onDismiss }) => {
  const { requestSlot } = useAnimationPool();
  const slotReleaseRef = useRef<() => void>();
  const translateX = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    requestSlot(AnimationConfig.alertTtlMs).then(({ release }) => {
      slotReleaseRef.current = release;
      translateX.value = withSequence(
        withSpring(-100, { damping: 12 }),
        withTiming(0, { duration: 150 }),
        withSpring(50, { damping: 8 }),
      );
      opacity.value = withTiming(1, { duration: AnimationConfig.staggerDelayMs });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
      timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 250 });
        onDismiss();
      }, AnimationConfig.alertTtlMs);
    });

    return () => {
      if (timer) clearTimeout(timer);
      slotReleaseRef.current?.();
    };
  }, [onDismiss, opacity, requestSlot, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const formattedDip = useMemo(() => `${alert.dipPercentage.toFixed(1)}% DIP!`, [alert.dipPercentage]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient colors={GRADIENTS.dipAlert} style={styles.gradient}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🐾</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Bear Claw Detected</Text>
          <Text style={styles.subtitle}>{`${alert.symbol} dropped to $${alert.price.toFixed(2)}`}</Text>
        </View>
        <View style={styles.dipBadge}>
          <Text style={styles.dipText}>{formattedDip}</Text>
        </View>
      </LinearGradient>
      <View style={styles.overlay} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.dipSplash,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.alertGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  dipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lossRed,
    borderRadius: 12,
  },
  dipText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.dipSplash,
    pointerEvents: 'none',
  },
});

export default DipAlertBanner;
