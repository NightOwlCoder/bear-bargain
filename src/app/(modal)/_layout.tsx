import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="trade-confirm" options={{ headerShown: false }} />
      <Stack.Screen name="trade-success" options={{ headerShown: false }} />
    </Stack>
  );
}
