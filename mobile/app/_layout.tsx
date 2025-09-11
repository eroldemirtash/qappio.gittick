import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ 
        headerShown: true, 
        headerTitleAlign: 'center',
        headerTitle: 'Qappio',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerLeft: () => (
          <Pressable style={{ marginLeft: 16, padding: 4 }} onPress={() => router.back()} accessibilityLabel="Geri">
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 16, gap: 16 }}>
            <Pressable style={{ padding: 4 }} onPress={() => router.push('/messages')} accessibilityLabel="Mesajlar">
              <Ionicons name="chatbubble-outline" size={24} color="#000000" />
            </Pressable>
            <Pressable style={{ padding: 4 }} onPress={() => router.push('/notifications')} accessibilityLabel="Bildirimler">
              <Ionicons name="notifications-outline" size={24} color="#000000" />
            </Pressable>
          </View>
        ),
      }}>
        {/* Auth sayfaları için header gizle */}
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}