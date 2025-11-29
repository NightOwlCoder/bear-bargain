import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AnimationProvider } from '../providers/AnimationProvider';
import useDipDetector from '../hooks/useDipDetector';
import DipAlertBanner from '../components/DipAlertBanner';
import { COLORS } from '../constants/colors';
import { ETFSymbol } from '../types/schemas';

const symbols: ETFSymbol[] = ['IBIT', 'ETHA', 'STCE'];

const ETFCard: React.FC<{ symbol: ETFSymbol; price?: number; change?: number; onTestDip: () => void }> = ({
  symbol,
  price,
  change,
  onTestDip,
}) => {
  const formattedPrice = price ? `$${price.toFixed(2)}` : 'Loading...';
  const formattedChange = change !== undefined ? `${change.toFixed(2)}%` : '–';
  const changeColor =
    change !== undefined && change < 0 ? COLORS.lossRed : change !== undefined ? COLORS.gainGreen : COLORS.textSecondary;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{symbol}</Text>
        <Pressable onPress={onTestDip} style={styles.testButton}>
          <Text style={styles.testButtonText}>Trigger Dip</Text>
        </Pressable>
      </View>
      <Text style={styles.cardPrice}>{formattedPrice}</Text>
      <Text style={[styles.cardChange, { color: changeColor }]}>{formattedChange}</Text>
    </View>
  );
};

const DipDashboard: React.FC = () => {
  const { prices, activeAlert, dismissAlert, triggerManualDip, status, threshold } = useDipDetector();

  const cards = useMemo(
    () =>
      symbols.map((symbol) => ({
        symbol,
        price: prices[symbol]?.price,
        change: prices[symbol]?.change24h,
      })),
    [prices],
  );

  return (
    <AnimationProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Dip Dashboard</Text>
        <Text style={styles.subheading}>{`Status: ${status} • Threshold ${threshold}%`}</Text>
        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <ETFCard
              key={card.symbol}
              symbol={card.symbol}
              price={card.price}
              change={card.change}
              onTestDip={() => triggerManualDip(card.symbol)}
            />
          ))}
        </View>

        {activeAlert ? <DipAlertBanner alert={activeAlert} onDismiss={dismissAlert} /> : null}

        <Text style={styles.footer}>Data powered by CoinGecko</Text>
      </ScrollView>
    </AnimationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    minHeight: '100%',
  },
  heading: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardPrice: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  cardChange: {
    marginTop: 4,
    fontSize: 14,
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.bearPrimary,
    borderRadius: 12,
  },
  testButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  footer: {
    color: COLORS.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DipDashboard;
