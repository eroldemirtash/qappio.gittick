import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/store/useAuth';
import { loginSchema, type LoginForm } from '@/src/features/auth/schemas';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email);
      router.push(`/(auth)/otp?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-text mb-2">Qappio'ya Hoş Geldin</Text>
        <Text className="text-sub text-base">Email adresini gir, OTP kodu gönderelim</Text>
      </View>

      <View className="mb-6">
        <Text className="text-text font-semibold mb-2">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3 text-text text-base"
              placeholder="ornek@email.com"
              placeholderTextColor="#94a3b8"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        />
        {errors.email && (
          <Text className="text-danger text-sm mt-1">{errors.email.message}</Text>
        )}
      </View>

      <Pressable
        className={`py-4 rounded-xl ${loading ? 'bg-sub' : 'bg-primary'}`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text className="text-center text-white font-semibold text-base">
          {loading ? 'Gönderiliyor...' : 'OTP Gönder'}
        </Text>
      </Pressable>
    </View>
  );
}
