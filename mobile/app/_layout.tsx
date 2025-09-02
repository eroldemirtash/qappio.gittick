import { Stack } from 'expo-router';
import AppHeader from '@/src/components/AppHeader';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ header: (p) => <AppHeader {...p} /> }}>
      <Stack.Screen name="(tabs)" options={{ headerTitle: 'Akış' }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="missions/[id]" options={{ headerTitle: 'Görev Detayı' }} />
      <Stack.Screen name="submit/[missionId]" options={{ headerTitle: 'Görev Yükle' }} />
      <Stack.Screen name="messages/index" options={{ headerTitle: 'Mesajlar' }} />
      <Stack.Screen name="notifications/index" options={{ headerTitle: 'Bildirimler' }} />
    </Stack>
  );
}
