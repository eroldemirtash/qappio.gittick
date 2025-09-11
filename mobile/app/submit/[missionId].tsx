import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  TextInput, 
  Image, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  Switch,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';

const { width } = Dimensions.get('window');

export default function SubmitScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [facebookShare, setFacebookShare] = useState(true);
  const [twitterShare, setTwitterShare] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          id, title, description, reward_qp, cover_url,
          brands!missions_brand_id_fkey (
            id, name, brand_profiles (logo_url)
          )
        `)
        .eq('id', missionId)
        .single();

      if (error) throw error;
      setMission(data);
    } catch (error) {
      console.error('Mission fetch error:', error);
      Alert.alert('Hata', 'Görev yüklenemedi');
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
      Alert.alert('Hata', 'Resim seçilemedi');
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
      Alert.alert('Hata', 'Fotoğraf çekilemedi');
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

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Uyarı', 'Lütfen bir fotoğraf seçin');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir açıklama yazın');
      return;
    }

    setUploading(true);

    try {
      // Upload image
      const imagePath = await uploadImage(selectedImage);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Hata', 'Kullanıcı giriş yapmamış');
        return;
      }

      // Create submission
      const { error } = await supabase
        .from('submissions')
        .insert({
          mission_id: missionId,
          user_id: user.id,
          media: [{ path: imagePath, type: 'image' }],
          note: description,
          status: 'review',
        });

      if (error) throw error;

      Alert.alert('Başarılı', 'Göreviniz başarıyla gönderildi!', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Hata', 'Görev gönderilemedi');
    } finally {
      setUploading(false);
    }
  };

  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <Pressable 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={20} color="#ffffff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={80} color="#d1d5db" />
              <Text style={styles.photoPlaceholderText}>Fotoğraf ekleyin</Text>
              <View style={styles.photoButtons}>
                <Pressable style={styles.photoButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#ffffff" />
                  <Text style={styles.photoButtonText}>Çek</Text>
                </Pressable>
                <Pressable style={styles.photoButton} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#ffffff" />
                  <Text style={styles.photoButtonText}>Yükle</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Açıklama..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Sharing Options */}
        <View style={styles.sharingSection}>
          <View style={styles.sharingOption}>
            <View style={styles.sharingOptionLeft}>
              <Ionicons name="logo-facebook" size={20} color="#1877f2" />
              <Text style={styles.sharingOptionText}>Facebook'ta Paylaş</Text>
            </View>
            <Switch
              value={facebookShare}
              onValueChange={setFacebookShare}
              trackColor={{ false: '#e5e7eb', true: '#1877f2' }}
              thumbColor={facebookShare ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.sharingOption}>
            <View style={styles.sharingOptionLeft}>
              <Ionicons name="logo-twitter" size={20} color="#1da1f2" />
              <Text style={styles.sharingOptionText}>Twitter'da Paylaş</Text>
            </View>
            <Switch
              value={twitterShare}
              onValueChange={setTwitterShare}
              trackColor={{ false: '#e5e7eb', true: '#1da1f2' }}
              thumbColor={twitterShare ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.sharingOption}>
            <View style={styles.sharingOptionLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
              <Text style={styles.sharingOptionText}>Yorum yapılabilir</Text>
            </View>
            <Switch
              value={commentsEnabled}
              onValueChange={setCommentsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#06b6d4' }}
              thumbColor={commentsEnabled ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable 
          style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          <LinearGradient
            colors={['#06b6d4', '#0891b2', '#0e7490']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitButtonText}>
              {uploading ? 'Yükleniyor...' : 'Bende Varım'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  photoSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 24,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sharingSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  sharingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sharingOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  submitButton: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});