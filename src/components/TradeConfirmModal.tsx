import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { usePortfolio } from '../hooks/usePortfolio';
import { ETFSymbol } from '../types/schemas';

interface Props {
  symbol: string | undefined;
  price: number;
  dipPercentage: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export default function TradeConfirmModal({
  symbol,
  price,
  dipPercentage,
  onClose,
  onConfirm,
}: Props) {
  const parsedSymbol = (symbol as ETFSymbol) || 'IBIT';
  const projection = usePortfolio(parsedSymbol, price, dipPercentage);
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.94);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 250 });
    cardScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    return () => {
      isMountedRef.current = false;
    };
  }, [cardScale, isMountedRef, overlayOpacity]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const handleBuy = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await onConfirm(projection.recommendedAmount);

    if (isMountedRef.current) {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, modalStyle]}>
        <LinearGradient colors={[COLORS.bearPrimary, '#0f172a']} style={styles.gradient}>
          <View style={styles.header}>
            <Text style={styles.title}>🐻 TRADE CONFIRM</Text>
            <Text style={styles.subtitle}>Mock execution — simulation only</Text>
          </View>

          <View style={styles.badgeRow}>
            <Text style={styles.dipBadge}>🐾 {dipPercentage.toFixed(1)}% DIP DETECTED!</Text>
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.symbolPrice}>
              {parsedSymbol} @ ${price.toFixed(2)}
            </Text>
            <Text style={styles.recommendedLabel}>Recommended buy</Text>
            <Text style={styles.recommendedAmount}>
              ${projection.recommendedAmount.toLocaleString()}
            </Text>
            <Text style={styles.recommendedShares}>🎯 {projection.recommendedShares.toFixed(0)} shares</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Portfolio Impact</Text>
              <Text style={styles.metricValue}>+{projection.portfolioImpactPercent.toFixed(1)}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Current DCA</Text>
              <Text style={styles.metricValue}>${projection.baseHolding.avgPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>New DCA (after buy)</Text>
              <Text style={styles.metricHighlight}>${projection.newDollarCostAverage.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              disabled={isConfirming}
            >
              <Text style={styles.secondaryText}>Later 😴</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.primaryButton, isConfirming && styles.buttonDisabled]}
              onPress={handleBuy}
              accessibilityRole="button"
              accessibilityLabel="Execute mock buy now"
              disabled={isConfirming}
            >
              <Text style={styles.buyText}>{isConfirming ? 'Executing…' : 'BUY NOW!'}</Text>
              <Text style={styles.buyDetails}>
                ${projection.recommendedAmount.toLocaleString()} {parsedSymbol}
              </Text>
              <Text style={styles.buyShares}>🎯 {projection.recommendedShares.toFixed(0)} shares</Text>
            </Pressable>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  gradient: {
    padding: 24,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gold,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  badgeRow: {
    alignItems: 'center',
  },
  dipBadge: {
    backgroundColor: 'rgba(239,68,68,0.16)',
    color: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailsBox: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 6,
  },
  symbolPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recommendedLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  recommendedAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.gold,
  },
  recommendedShares: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  metrics: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  metricHighlight: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buyText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '900',
  },
  buyDetails: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  buyShares: {
    color: '#1f2937',
    fontSize: 12,
  },
});
