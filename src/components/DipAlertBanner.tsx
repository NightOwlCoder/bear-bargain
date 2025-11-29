import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { DipAlert } from '../types/schemas';
import { AnimationConfig } from '../utils/featureFlags';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useAnimationPool } from '../providers/AnimationProvider';

interface Props {
  alert: DipAlert;
  onDismiss: () => void;
}

export const DipAlertBanner: React.FC<Props> = ({ alert, onDismiss }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const { requestSlot, releaseSlot } = useAnimationPool();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let currentSlot: string | null = null;
    requestSlot(AnimationConfig.alertTtlMs).then((id) => {
      if (cancelled) {
        releaseSlot(id);
        return;
      }
      currentSlot = id;
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      translateX.value = withSequence(
        withSpring(-100, { damping: 12 }),
        withTiming(0, { duration: 150 }),
        withSpring(50, { damping: 8 }),
      );
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
      }
      timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 250 });
        onDismiss();
        releaseSlot(id);
      }, AnimationConfig.alertTtlMs);
    });

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      if (currentSlot) releaseSlot(currentSlot);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.alertId]);

  return (
    <Animated.View style={[styles.container, animatedStyle]} accessibilityRole="alert">
      <LinearGradient colors={[...GRADIENTS.dipAlert]} style={styles.banner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🐾</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Bear Alert!</Text>
          <Text style={styles.subtitle}>
            {alert.symbol} {alert.dipPercentage}% DIP! — ${alert.price.toFixed(2)}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 32,
    left: 16,
    right: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.alertGlow,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lossRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.lossRed,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DipAlertBanner;
