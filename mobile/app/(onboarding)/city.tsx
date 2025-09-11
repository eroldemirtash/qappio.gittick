import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
// Auth imports geçici olarak devre dışı

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
  'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır'
];

export default function CityScreen() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const router = useRouter();
  // Auth geçici olarak devre dışı

  const handleContinue = () => {
    // Direkt ana uygulamaya yönlendir
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-bg px-6">
      <View className="pt-16 pb-8">
        <Text className="text-3xl font-bold text-text mb-2">Şehrin</Text>
        <Text className="text-sub text-base">Hangi şehirde yaşıyorsun?</Text>
      </View>

      <ScrollView className="flex-1 mb-6">
        <View className="gap-3">
          {CITIES.map((city) => (
            <Pressable
              key={city}
              className={`px-4 py-4 rounded-xl border ${
                selectedCity === city
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
              onPress={() => setSelectedCity(city)}
            >
              <Text className={`font-semibold text-lg ${
                selectedCity === city ? 'text-white' : 'text-text'
              }`}>
                {city}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        className="py-4 rounded-xl bg-primary"
        onPress={handleContinue}
      >
        <Text className="text-center text-white font-semibold text-base">
          Ana Uygulamaya Git
        </Text>
      </Pressable>
    </View>
  );
}
