import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
// Location imports geçici olarak devre dışı

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Session geçici olarak devre dışı

  const requestLocationPermission = () => {
    setLoading(true);
    // Direkt ana uygulamaya yönlendir
    router.replace('/(tabs)');
  };

  const skipLocation = () => {
    // Direkt ana uygulamaya yönlendir
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-bg px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-text mb-2">Konum İzni</Text>
        <Text className="text-sub text-base mb-4">
          Konum izni vererek yakınındaki görevleri keşfedebilirsin
        </Text>
        <Text className="text-sub text-sm">
          • Yakındaki görevleri gör
        </Text>
        <Text className="text-sub text-sm">
          • Geofence kontrolleri
        </Text>
        <Text className="text-sub text-sm">
          • Lokasyon bazlı ödüller
        </Text>
      </View>

      <View className="gap-4">
        <Pressable
          className={`py-4 rounded-xl ${loading ? 'bg-sub' : 'bg-primary'}`}
          onPress={requestLocationPermission}
          disabled={loading}
        >
          <Text className="text-center text-white font-semibold text-base">
            {loading ? 'İzin İsteniyor...' : 'Konum İzni Ver'}
          </Text>
        </Pressable>

        <Pressable
          className="py-4 rounded-xl border border-border"
          onPress={skipLocation}
        >
          <Text className="text-center text-text font-semibold text-base">
            Şimdilik Atla
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
