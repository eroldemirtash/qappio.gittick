import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Auth sayfalarında header gizle
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
