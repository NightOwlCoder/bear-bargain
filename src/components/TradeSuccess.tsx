import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

const CONFETTI = ['🎉', '✨', '🎊', '💥', '🧨', '🌟'];

export default function TradeSuccess({ onClose }: { onClose: () => void }) {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);
  const confettiOffset = useSharedValue(-24);

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
    scale.value = withSpring(1, { damping: 10, stiffness: 140 });
    opacity.value = withTiming(1, { duration: 250 });
    confettiOffset.value = withSpring(0, { damping: 12, stiffness: 120 });
  }, [confettiOffset, opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: confettiOffset.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.confetti, confettiStyle]}>
        {CONFETTI.map((emoji, index) => (
          <Text key={emoji + index} style={styles.confettiEmoji}>
            {emoji}
          </Text>
        ))}
      </Animated.View>

      <Animated.View style={[styles.modal, cardStyle]}>
        <LinearGradient colors={[COLORS.bearPrimary, '#0f172a']} style={styles.gradient}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.title}>TRADE EXECUTED!</Text>
          <Text style={styles.subtitle}>🐻 You sniped the dip!</Text>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>BACK TO DASHBOARD</Text>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 24,
  },
  confetti: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.9,
  },
  confettiEmoji: {
    fontSize: 28,
  },
  modal: {
    width: '88%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  gradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
  },
  doneText: {
    color: '#1f2937',
    fontWeight: '800',
  },
});
