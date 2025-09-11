import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { card3DStyles } from '@/src/theme/card3D';

export default function SubmitScreen() {
  const insets = useSafeAreaInsets();
  const { missionId } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [shareFacebook, setShareFacebook] = useState(true);
  const [shareTwitter, setShareTwitter] = useState(true);
  const [allowComments, setAllowComments] = useState(false);

  // Görevden gelen otomatik hashtagler
  const missionHashtags = ['#selfie', '#gittick', '#mavi'];

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri izni gereklidir.');
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
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      Alert.alert('Fotoğraf Gerekli', 'Lütfen bir fotoğraf seçin.');
      return;
    }

    // Burada gerçek uygulamada API çağrısı yapılacak
    Alert.alert('Başarılı!', 'Gönderiniz paylaşıldı!', [
      { text: 'Tamam', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#94a3b8" />
              <Text style={styles.placeholderText}>Fotoğraf ekleyin</Text>
            </View>
          )}
          
          <View style={styles.imageButtons}>
            <Pressable style={styles.imageButton} onPress={takePhoto}>
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.imageButtonGradient}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.imageButtonText}>Çek</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable style={styles.imageButton} onPress={pickImage}>
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.imageButtonGradient}
              >
                <Ionicons name="images-outline" size={20} color="#ffffff" />
                <Text style={styles.imageButtonText}>Yükle</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Açıklama..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            style={styles.customHashtagsInput}
            placeholder="Kendi hashtaglerinizi ekleyin..."
            value={customHashtags}
            onChangeText={setCustomHashtags}
            multiline
          />
          
          {/* Otomatik Hashtagler */}
          <View style={styles.autoHashtagsContainer}>
            <Text style={styles.autoHashtagsLabel}>Otomatik Hashtagler:</Text>
            <View style={styles.autoHashtagsList}>
              {missionHashtags.map((hashtag, index) => (
                <View key={index} style={styles.autoHashtagItem}>
                  <Text style={styles.autoHashtagText}>{hashtag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sharing Options */}
        <View style={styles.sharingSection}>
          <View style={styles.sharingOption}>
            <Text style={styles.sharingText}>Facebook'ta Paylaş</Text>
            <Pressable 
              style={[styles.toggle, shareFacebook && styles.toggleActive]}
              onPress={() => setShareFacebook(!shareFacebook)}
            >
              <View style={[styles.toggleButton, shareFacebook && styles.toggleButtonActive]} />
            </Pressable>
          </View>
          
          <View style={styles.sharingOption}>
            <Text style={styles.sharingText}>Twitter'da Paylaş</Text>
            <Pressable 
              style={[styles.toggle, shareTwitter && styles.toggleActive]}
              onPress={() => setShareTwitter(!shareTwitter)}
            >
              <View style={[styles.toggleButton, shareTwitter && styles.toggleButtonActive]} />
            </Pressable>
          </View>
          
          <View style={styles.sharingOption}>
            <Text style={styles.sharingText}>Yorum yapılabilir</Text>
            <Pressable 
              style={[styles.toggle, allowComments && styles.toggleActive]}
              onPress={() => setAllowComments(!allowComments)}
            >
              <View style={[styles.toggleButton, allowComments && styles.toggleButtonActive]} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={['#00bcd4', '#0097a7', '#006064']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Bende Varım</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  imageButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  descriptionInput: {
    ...card3DStyles.card3D,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  autoHashtagsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  autoHashtagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  autoHashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  autoHashtagItem: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  autoHashtagText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },

  customHashtagsInput: {
    ...card3DStyles.card3D,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    color: '#1e293b',
    marginTop: 12,
  },
  sharingSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sharingText: {
    fontSize: 16,
    color: '#1e293b',
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleButton: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  toggleButtonActive: {
    transform: [{ translateX: 20 }],
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
