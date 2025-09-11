import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useSession } from '@/src/store/useSession';

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setOnboarded } = useSession();

  const requestLocationPermission = async () => {
    setLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setOnboarded(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Konum İzni',
          'Konum izni verilmedi. Görevler için konum gerekli olabilir.',
          [
            { text: 'Tekrar Dene', onPress: requestLocationPermission },
            { text: 'Atla', onPress: () => {
              setOnboarded(true);
              router.replace('/(tabs)');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Hata', 'Konum izni alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const skipLocation = () => {
    setOnboarded(true);
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
