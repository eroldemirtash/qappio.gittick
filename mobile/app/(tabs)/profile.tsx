import { View, Text, Pressable, Alert } from 'react-native';
import { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/useAuth';
import { maybeRegisterPush } from '@/src/utils/push';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, profile, signOut } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Profil' });
  }, [navigation]);

  useEffect(() => {
    // Push notifications tamamen devre dışı
    console.log('Push notifications disabled');
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await maybeRegisterPush();
      if (token) {
        setPushToken(token.data);
      }

      // Save token to profile
      if (user && token) {
        await supabase
          .from('profiles')
          .update({ push_token: token.data })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gray-500 rounded-full mb-4" />
          <Text className="text-slate-200 text-xl font-bold mb-2">
            {profile?.display_name || 'Kullanıcı'}
          </Text>
          <Text className="text-slate-400 text-base">
            {profile?.city || 'Şehir belirtilmemiş'}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
          <Text className="text-slate-200 font-semibold mb-3 text-base">Profil Bilgileri</Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Email</Text>
              <Text className="text-slate-200 text-sm">{user?.email}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Seviye</Text>
              <Text className="text-slate-200 text-sm">{profile?.level_name || 'Başlangıç'}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Push Bildirimler</Text>
              <Text className="text-slate-200 text-sm">
                {pushToken ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Pressable className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <Text className="text-slate-200 font-medium text-base">Hesap Ayarları</Text>
          </Pressable>
          
          <Pressable className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <Text className="text-slate-200 font-medium text-base">Gizlilik</Text>
          </Pressable>
          
          <Pressable className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <Text className="text-slate-200 font-medium text-base">Yardım & Destek</Text>
          </Pressable>
          
          <Pressable className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <Text className="text-slate-200 font-medium text-base">Hakkında</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-xl mt-8"
        >
          <Text className="text-white font-medium text-center text-base">Çıkış Yap</Text>
        </Pressable>
      </View>
    </View>
  );
}

