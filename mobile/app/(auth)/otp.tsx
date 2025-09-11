import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
// Auth imports geçici olarak devre dışı

export default function OtpScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleVerify = () => {
    setLoading(true);
    // Direkt ana uygulamaya yönlendir
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-bg px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-text mb-2">OTP Doğrulama</Text>
        <Text className="text-sub text-base">
          Geçici olarak devre dışı - direkt ana uygulamaya yönlendiriliyor
        </Text>
      </View>

      <Pressable
        className={`py-4 rounded-xl ${loading ? 'bg-sub' : 'bg-primary'}`}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text className="text-center text-white font-semibold text-base">
          {loading ? 'Yönlendiriliyor...' : 'Ana Uygulamaya Git'}
        </Text>
      </Pressable>

      <Pressable
        className="mt-4"
        onPress={() => router.back()}
      >
        <Text className="text-center text-sub text-base">Geri Dön</Text>
      </Pressable>
    </View>
  );
}
