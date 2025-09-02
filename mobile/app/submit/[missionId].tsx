import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Image, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/src/lib/supabase';
import { MissionDetail } from '@/src/features/missions/types';
import { isInsideRadius } from '@/src/utils/geo';
import { useUI } from '@/src/store/useUI';
import { z } from 'zod';

const submitSchema = z.object({
  caption: z.string().min(1, 'Açıklama gerekli'),
});

type SubmitForm = z.infer<typeof submitSchema>;

export default function SubmitScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const router = useRouter();
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useUI();

  const { control, handleSubmit, formState: { errors } } = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
  });

  useEffect(() => {
    if (missionId) {
      fetchMission();
    }
  }, [missionId]);

  const fetchMission = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          id, title, description, reward_qp, deadline, location_lat, location_lng, location_radius, status,
          brand:brands ( id, name, logo_url )
        `)
        .eq('id', missionId)
        .single();

      if (error) throw error;
      setMission(data);
    } catch (error) {
      console.error('Mission fetch error:', error);
      showToast('Görev yüklenemedi', 'error');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gerekli');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showToast('Resim seçilemedi', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera erişimi için izin gerekli');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      showToast('Fotoğraf çekilemedi', 'error');
    }
  };

  const checkLocation = async (): Promise<boolean> => {
    if (!mission?.location_lat || !mission?.location_lng || !mission?.location_radius) {
      return true; // No location requirement
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Bu görev için konum izni gerekli');
        return false;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;

      const isInside = isInsideRadius(
        userLat,
        userLng,
        mission.location_lat,
        mission.location_lng,
        mission.location_radius
      );

      if (!isInside) {
        Alert.alert(
          'Lokasyon Hatası',
          'Görev lokasyonuna yeterince yakın değilsiniz'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Location check error:', error);
      showToast('Konum kontrol edilemedi', 'error');
      return false;
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileName = `${missionId}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('mission-media')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;
    return data.path;
  };

  const onSubmit = async (data: SubmitForm) => {
    if (!selectedImage) {
      showToast('Lütfen bir resim seçin', 'error');
      return;
    }

    const locationOk = await checkLocation();
    if (!locationOk) return;

    setUploading(true);

    try {
      // Upload image
      const imagePath = await uploadImage(selectedImage);

      // Create submission
      const { error } = await supabase
        .from('submissions')
        .insert({
          mission_id: missionId,
          media_url: imagePath,
          caption: data.caption,
          status: 'pending',
        });

      if (error) throw error;

      showToast('Görev başarıyla yüklendi!', 'success');
      router.back();
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Görev yüklenemedi', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!mission) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <Text className="text-text">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg px-6">
      <View className="pt-6 pb-4">
        <Text className="text-2xl font-bold text-text mb-2">{mission.title}</Text>
        <Text className="text-sub">Görevini tamamla ve {mission.reward_qp} QP kazan</Text>
      </View>

      {/* Image Selection */}
      <View className="mb-6">
        <Text className="text-text font-semibold mb-3">Görev Fotoğrafı</Text>
        
        {selectedImage ? (
          <View className="relative">
            <Image source={{ uri: selectedImage }} className="w-full h-64 rounded-xl" />
            <Pressable
              className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={32} color="#94a3b8" />
              <Text className="text-text font-semibold mt-2">Galeri</Text>
            </Pressable>
            
            <Pressable
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={32} color="#94a3b8" />
              <Text className="text-text font-semibold mt-2">Kamera</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Caption */}
      <View className="mb-6">
        <Text className="text-text font-semibold mb-3">Açıklama</Text>
        <Controller
          control={control}
          name="caption"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3 text-text text-base"
              placeholder="Görevin hakkında bir açıklama yaz..."
              placeholderTextColor="#94a3b8"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.caption && (
          <Text className="text-danger text-sm mt-1">{errors.caption.message}</Text>
        )}
      </View>

      {/* Submit Button */}
      <Pressable
        className={`py-4 rounded-xl mb-6 ${uploading ? 'bg-sub' : 'bg-primary'}`}
        onPress={handleSubmit(onSubmit)}
        disabled={uploading}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {uploading ? 'Yükleniyor...' : 'Görevi Gönder'}
        </Text>
      </Pressable>
    </View>
  );
}
