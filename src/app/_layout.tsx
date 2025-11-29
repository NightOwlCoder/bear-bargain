import { Stack } from 'expo-router';
import { AnimationProvider } from '../providers/AnimationProvider';

export default function RootLayout() {
  return (
    <AnimationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AnimationProvider>
  );
}
