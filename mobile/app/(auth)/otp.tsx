import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/store/useAuth';
import { otpSchema, type OtpForm } from '@/src/features/auth/schemas';

export default function OtpScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: email || '' },
  });

  const onSubmit = async (data: OtpForm) => {
    setLoading(true);
    try {
      await verifyOtp(data.email, data.token);
      router.replace('/(onboarding)/interests');
    } catch (error) {
      Alert.alert('Hata', 'OTP doğrulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-text mb-2">OTP Doğrulama</Text>
        <Text className="text-sub text-base">
          {email} adresine gönderilen 6 haneli kodu gir
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-text font-semibold mb-2">OTP Kodu</Text>
        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3 text-text text-base text-center text-2xl tracking-widest"
              placeholder="123456"
              placeholderTextColor="#94a3b8"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
        />
        {errors.token && (
          <Text className="text-danger text-sm mt-1">{errors.token.message}</Text>
        )}
      </View>

      <Pressable
        className={`py-4 rounded-xl ${loading ? 'bg-sub' : 'bg-primary'}`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text className="text-center text-white font-semibold text-base">
          {loading ? 'Doğrulanıyor...' : 'Doğrula'}
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
