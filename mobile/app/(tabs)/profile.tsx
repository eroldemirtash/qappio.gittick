import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/useAuth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-6 py-8">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#00bcd4" />
          </View>
          <Text className="text-2xl font-bold text-text mb-1">
            {profile?.display_name || 'Kullanıcı'}
          </Text>
          <Text className="text-sub">{profile?.city || 'Şehir belirtilmemiş'}</Text>
        </View>

        {/* Menu Items */}
        <View className="space-y-2">
          <Pressable className="bg-card rounded-xl p-4 flex-row items-center">
            <Ionicons name="settings-outline" size={24} color="#e5e7eb" />
            <Text className="text-text font-semibold ml-4">Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" className="ml-auto" />
          </Pressable>

          <Pressable className="bg-card rounded-xl p-4 flex-row items-center">
            <Ionicons name="help-circle-outline" size={24} color="#e5e7eb" />
            <Text className="text-text font-semibold ml-4">Yardım</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" className="ml-auto" />
          </Pressable>

          <Pressable className="bg-card rounded-xl p-4 flex-row items-center">
            <Ionicons name="information-circle-outline" size={24} color="#e5e7eb" />
            <Text className="text-text font-semibold ml-4">Hakkında</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" className="ml-auto" />
          </Pressable>

          <Pressable 
            className="bg-danger/10 rounded-xl p-4 flex-row items-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-danger font-semibold ml-4">Çıkış Yap</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
