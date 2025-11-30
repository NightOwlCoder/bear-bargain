import { useLocalSearchParams, useRouter } from 'expo-router';
import TradeConfirmModal from '@/components/TradeConfirmModal';
import { useTrade } from '@/hooks/useTrade';
import { ETFSymbol } from '@/types/schemas';

export default function TradeConfirm() {
  const { symbol, price, dipPercentage } = useLocalSearchParams<{
    symbol?: string | string[];
    price?: string | string[];
    dipPercentage?: string | string[];
  }>();
  const router = useRouter();
  const { executeTrade } = useTrade();

  const parsedSymbol = (Array.isArray(symbol) ? symbol[0] : symbol) as ETFSymbol;
  const parsedPrice = parseFloat(Array.isArray(price) ? price?.[0] ?? '' : price ?? '');
  const parsedDip = parseFloat(Array.isArray(dipPercentage) ? dipPercentage?.[0] ?? '' : dipPercentage ?? '');
  const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const safeDip = Number.isFinite(parsedDip) ? parsedDip : 0;
  const safeSymbol = parsedSymbol || 'IBIT';

  const handleConfirm = async (amount: number) => {
    if (safePrice > 0) {
      await executeTrade({ symbol: safeSymbol, amount, price: safePrice });
    }
    router.push('/(modal)/trade-success');
  };

  return (
    <TradeConfirmModal
      symbol={safeSymbol}
      price={safePrice}
      dipPercentage={safeDip}
      onClose={() => router.back()}
      onConfirm={handleConfirm}
    />
  );
}
