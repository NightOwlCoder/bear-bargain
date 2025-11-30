import TradeSuccess from '@/components/TradeSuccess';
import { useRouter } from 'expo-router';

export default function TradeSuccessScreen() {
  const router = useRouter();

  return <TradeSuccess onClose={() => router.dismissAll()} />;
}
