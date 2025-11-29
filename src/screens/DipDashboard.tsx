import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import DipAlertBanner from '../components/DipAlertBanner';
import AnimationProvider from '../providers/AnimationProvider';
import useDipDetector from '../hooks/useDipDetector';
import { COLORS } from '../constants/colors';
import { ETF_SYMBOLS } from '../types/schemas';

const PriceCard: React.FC<{
  symbol: string;
  price: number;
  change24h: number;
}> = ({ symbol, price, change24h }) => {
  const changeColor = change24h >= 0 ? COLORS.gainGreen : COLORS.lossRed;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{symbol}</Text>
      <Text style={styles.cardPrice}>${price.toFixed(2)}</Text>
      <Text style={[styles.cardChange, { color: changeColor }]}>{change24h.toFixed(2)}%</Text>
    </View>
  );
};

export const DipDashboard: React.FC = () => {
  const { prices, activeAlert } = useDipDetector();
  const [testAlert, setTestAlert] = useState<typeof activeAlert>(null);

  const triggerTestDip = () => {
    const currentPrice = prices.IBIT?.price || 91295;
    const dipPrice = currentPrice * 0.88; // -12%
    
    setTestAlert({
      symbol: 'IBIT' as const,
      price: dipPrice,
      dipPercentage: 12,
      highPrice: currentPrice,
      timestamp: Date.now(),
      alertId: `test-${Date.now()}`,
    });
    
    console.log('🐻 MANUAL DIP TRIGGERED: IBIT', dipPrice);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => setTestAlert(null), 5000);
  };

  const displayAlert = testAlert || activeAlert;

  const cards = useMemo(
    () =>
      ETF_SYMBOLS.map((symbol) => (
        <PriceCard
          key={symbol}
          symbol={symbol}
          price={prices[symbol]?.price ?? 0}
          change24h={prices[symbol]?.change24h ?? 0}
        />
      )),
    [prices],
  );

  return (
    <AnimationProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Dip Dashboard</Text>
        <ScrollView contentContainerStyle={styles.scroll}>{cards}</ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by CoinGecko</Text>
        </View>
        <TouchableOpacity style={styles.dipButton} onPress={triggerTestDip}>
          <Text style={styles.dipButtonText}>🚨 SIMULATE 12% DIP</Text>
        </TouchableOpacity>
        {displayAlert ? <DipAlertBanner alert={displayAlert} /> : null}
      </View>
    </AnimationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 48,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  cardPrice: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  cardChange: {
    marginTop: 6,
    fontWeight: '600',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  dipButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  dipButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DipDashboard;
