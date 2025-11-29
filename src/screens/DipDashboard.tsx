import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DipAlertBanner from '../components/DipAlertBanner';
import { useDipDetector } from '../hooks/useDipDetector';
import { COLORS } from '../constants/colors';
import { AnimationProvider } from '../providers/AnimationProvider';

const formatPrice = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? `$${value.toFixed(2)}` : '—';

const DipDashboardContent = () => {
  const { prices, activeAlert, dismissAlert, status, reconnect } = useDipDetector();

  const cards: { symbol: 'IBIT' | 'ETHA' | 'STCE'; label: string }[] = [
    { symbol: 'IBIT', label: 'Bitcoin ETF' },
    { symbol: 'ETHA', label: 'Ethereum ETF' },
    { symbol: 'STCE', label: 'Staked ETH ETF' },
  ];

  const openAttribution = () => Linking.openURL('https://www.coingecko.com/?utm_source=bearbargain&utm_medium=app');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>BearBargain Dips</Text>
        <Text style={styles.status}>Detector: {status.toUpperCase()}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {cards.map((card) => {
          const price = prices[card.symbol];
          const changeColor = (price?.change24h ?? 0) < 0 ? COLORS.lossRed : COLORS.gainGreen;
          return (
            <View key={card.symbol} style={styles.card}>
              <Text style={styles.symbol}>{card.symbol}</Text>
              <Text style={styles.label}>{card.label}</Text>
              <Text style={styles.price}>{formatPrice(price?.price)}</Text>
              <Text style={[styles.change, { color: changeColor }]}>
                24h: {(price?.change24h ?? 0).toFixed(2)}%
              </Text>
            </View>
          );
        })}

        <View style={styles.footer}>
          <TouchableOpacity onPress={openAttribution}>
            <Text style={styles.attribution}>Powered by CoinGecko</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={reconnect}>
            <Text style={styles.retryText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {activeAlert && <DipAlertBanner alert={activeAlert} onDismiss={dismissAlert} />}
    </SafeAreaView>
  );
};

const DipDashboard = () => (
  <AnimationProvider>
    <DipDashboardContent />
  </AnimationProvider>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  status: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  symbol: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  price: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  change: {
    marginTop: 6,
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attribution: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.bearSecondary,
  },
  retryText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});

export default DipDashboard;
