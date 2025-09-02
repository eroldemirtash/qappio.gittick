import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { MissionDetail } from '@/src/features/missions/types';
import { useUI } from '@/src/store/useUI';

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();

  useEffect(() => {
    if (id) {
      fetchMission();
    }
  }, [id]);

  const fetchMission = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          id, title, description, reward_qp, deadline, location_lat, location_lng, location_radius, status,
          brand:brands ( id, name, logo_url ),
          media_url
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setMission(data);
    } catch (error) {
      console.error('Mission fetch error:', error);
      showToast('Görev yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!mission) return;
    
    if (mission.status === 'closed') {
      showToast('Bu görev kapatılmış', 'error');
      return;
    }

    if (mission.deadline && new Date(mission.deadline) < new Date()) {
      showToast('Bu görevin süresi dolmuş', 'error');
      return;
    }

    router.push(`/submit/${mission.id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <Text className="text-text">Yükleniyor...</Text>
      </View>
    );
  }

  if (!mission) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <Text className="text-text">Görev bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg">
      {/* Mission Media */}
      {mission.media_url && (
        <View className="aspect-video bg-border">
          <Image
            source={{ uri: mission.media_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      )}

      <View className="p-6">
        {/* Brand Header */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: mission.brand.logo_url || 'https://via.placeholder.com/40x40' }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-text font-semibold">{mission.brand.name}</Text>
            <Text className="text-sub text-sm">Görev Veren</Text>
          </View>
        </View>

        {/* Mission Title */}
        <Text className="text-2xl font-bold text-text mb-4">{mission.title}</Text>

        {/* Description */}
        <Text className="text-text text-base leading-6 mb-6">{mission.description}</Text>

        {/* Mission Details */}
        <View className="bg-card rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="diamond" size={20} color="#f59e0b" />
              <Text className="text-text font-semibold ml-2">Ödül</Text>
            </View>
            <Text className="text-brand font-bold text-lg">{mission.reward_qp} QP</Text>
          </View>

          {mission.deadline && (
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#94a3b8" />
                <Text className="text-text font-semibold ml-2">Son Tarih</Text>
              </View>
              <Text className="text-sub">{new Date(mission.deadline).toLocaleDateString('tr-TR')}</Text>
            </View>
          )}

          {mission.location_lat && mission.location_lng && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#94a3b8" />
                <Text className="text-text font-semibold ml-2">Lokasyon</Text>
              </View>
              <Text className="text-sub">Gerekli</Text>
            </View>
          )}
        </View>

        {/* Status Badge */}
        <View className="mb-6">
          <View className={`px-4 py-2 rounded-full self-start ${
            mission.status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <Text className={`font-semibold ${
              mission.status === 'active' ? 'text-green-400' : 'text-red-400'
            }`}>
              {mission.status === 'active' ? 'Aktif' : 'Kapalı'}
            </Text>
          </View>
        </View>

        {/* Join Button */}
        <Pressable
          className={`py-4 rounded-xl ${
            mission.status === 'active' && (!mission.deadline || new Date(mission.deadline) > new Date())
              ? 'bg-primary'
              : 'bg-sub'
          }`}
          onPress={handleJoin}
          disabled={mission.status !== 'active' || (mission.deadline && new Date(mission.deadline) <= new Date())}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {mission.status === 'active' 
              ? 'Katıl ve Yükle' 
              : mission.deadline && new Date(mission.deadline) <= new Date()
                ? 'Süresi Dolmuş'
                : 'Kapalı'
            }
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
