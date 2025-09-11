import React, { useState, useLayoutEffect, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Image, 
  Alert,
  Modal,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/store/useAuth';
import { supabase } from '@/src/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
// AuthGuard geçici olarak devre dışı

export default function ProfileEditScreen() {
  return <ProfileEditContent />;
}

function ProfileEditContent() {
  const router = useRouter();
  const { profile, user, initialize } = useAuth();

  // Initialize auth state geçici olarak devre dışı
  // useEffect(() => {
  //   initialize();
  // }, []);

  // Create profile if it doesn't exist
  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (user && !profile) {
        console.log('🔄 Creating profile for user:', user.id);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: '',
              username: '',
              role: 'user',
              is_active: true,
              total_qp: 0,
              spendable_qp: 0,
              total_missions: 0,
              completed_missions: 0,
            })
            .select()
            .single();
          
          if (profileError) {
            console.error('❌ Profile creation error:', profileError);
          } else {
            console.log('✅ Profile created successfully:', profileData);
            // Profil oluşturuldu, state güncellenecek
          }
        } catch (error) {
          console.error('❌ Profile creation failed:', error);
        }
      }
    };

    createProfileIfNeeded();
  }, [user, profile]);

  // Check if user is authenticated geçici olarak devre dışı
  // useEffect(() => {
  //   console.log('🔍 Profile edit - checking auth state:', { user: !!user, profile: !!profile });
  //   if (!user) {
  //     console.log('❌ No user found, redirecting to login');
  //     router.replace('/(auth)/login');
  //   }
  // }, [user]);
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    gender: profile?.gender || 'erkek',
    profileImage: profile?.avatar_url || null,
    socials: {
      instagram: profile?.socials?.instagram || '',
      facebook: profile?.socials?.facebook || '',
      tiktok: profile?.socials?.tiktok || '',
      twitter: profile?.socials?.twitter || ''
    }
  });

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = [
    { value: 'erkek', label: 'Erkek' },
    { value: 'kadin', label: 'Kadın' },
    { value: 'belirtmek_istemiyorum', label: 'Belirtmek istemiyorum' }
  ];

  useLayoutEffect(() => {
    // Header'ı dinamik yapmak için
  }, []);

  const handleSave = async () => {
    console.log('Profile data:', profile);
    console.log('User data:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    
    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı giriş yapmamış. Lütfen önce giriş yapın.');
      return;
    }

    const userId = user.id;

    setIsLoading(true);
    try {
      // Önce profile var mı kontrol et
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      let result;
      if (existingProfile) {
        // Profile varsa güncelle
        result = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            username: formData.username,
            bio: formData.bio,
            gender: formData.gender,
            avatar_url: formData.profileImage,
            socials: formData.socials,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      } else {
        // Profile yoksa oluştur
        result = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: formData.fullName,
            username: formData.username,
            bio: formData.bio,
            gender: formData.gender,
            avatar_url: formData.profileImage,
            socials: formData.socials,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) throw result.error;

      Alert.alert('Başarılı', 'Profiliniz güncellendi!');
      router.back();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async () => {
    try {
      // İzin iste
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Hata', 'Galeri erişim izni gerekli!');
        return;
      }

      // Resim seç - Expo Go uyumluluğu için basit yaklaşım
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Önce local olarak güncelle (optimistic update)
        setFormData({ ...formData, profileImage: imageUri });
        
        try {
          // Supabase Storage'a yükle
          const fileName = `profile-${profile?.id}-${Date.now()}.jpg`;
          
          // Fetch the image and convert to blob
          const response = await fetch(imageUri);
          const blob = await response.blob();

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
            });

          if (uploadError) {
            console.warn('Storage upload failed, using local image:', uploadError);
            // Local image kullanmaya devam et
            return;
          }

          // Public URL al
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          setFormData({ ...formData, profileImage: publicUrl });
          Alert.alert('Başarılı', 'Profil resminiz güncellendi!');
        } catch (uploadError) {
          console.warn('Storage upload failed, using local image:', uploadError);
          // Local image kullanmaya devam et
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Picture Section */}
      <View style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#9ca3af" />
            </View>
          )}
        </View>
        <Pressable onPress={handleImageChange} style={styles.changeImageButton}>
          <Text style={styles.changeImageText}>Profil resmini değiştir</Text>
        </Pressable>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Ad</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            placeholder="Ad Soyad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Username Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Kullanıcı adı</Text>
          <TextInput
            style={styles.textInput}
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="kullaniciadi"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
        </View>

        {/* Bio Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Biyografi</Text>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Biyografinizi yazın"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Social Media Fields */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Sosyal Medya</Text>
          
          <View style={styles.socialField}>
            <View style={styles.socialFieldLeft}>
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              <Text style={styles.socialFieldLabel}>Instagram</Text>
            </View>
            <TextInput
              style={styles.socialInput}
              value={formData.socials.instagram}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                socials: { ...formData.socials, instagram: text }
              })}
              placeholder="@kullaniciadi"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialField}>
            <View style={styles.socialFieldLeft}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialFieldLabel}>Facebook</Text>
            </View>
            <TextInput
              style={styles.socialInput}
              value={formData.socials.facebook}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                socials: { ...formData.socials, facebook: text }
              })}
              placeholder="facebook.com/kullaniciadi"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialField}>
            <View style={styles.socialFieldLeft}>
              <Ionicons name="logo-tiktok" size={20} color="#000000" />
              <Text style={styles.socialFieldLabel}>TikTok</Text>
            </View>
            <TextInput
              style={styles.socialInput}
              value={formData.socials.tiktok}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                socials: { ...formData.socials, tiktok: text }
              })}
              placeholder="@kullaniciadi"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialField}>
            <View style={styles.socialFieldLeft}>
              <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              <Text style={styles.socialFieldLabel}>Twitter</Text>
            </View>
            <TextInput
              style={styles.socialInput}
              value={formData.socials.twitter}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                socials: { ...formData.socials, twitter: text }
              })}
              placeholder="@kullaniciadi"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Personal Information Link */}
        <Pressable 
          style={styles.personalInfoButton}
          onPress={() => router.push('/profile/personal-info')}
        >
          <View style={styles.personalInfoContent}>
            <View style={styles.personalInfoLeft}>
              <View style={styles.personalInfoIcon}>
                <Ionicons name="person-outline" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.personalInfoTitle}>Kişisel Bilgiler</Text>
                <Text style={styles.personalInfoSubtitle}>E-posta, telefon ve adres</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>
      </View>

      {/* Gender Card */}
      <View style={styles.genderCard}>
        <Text style={styles.fieldLabel}>Cinsiyet</Text>
        <Pressable 
          style={styles.genderButton}
          onPress={() => setShowGenderModal(true)}
        >
          <Text style={styles.genderButtonText}>
            {genderOptions.find(opt => opt.value === formData.gender)?.label}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </Pressable>
      </View>

      {/* Save Button */}
      <Pressable 
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#06b6d4', '#0891b2']}
          style={styles.saveButtonGradient}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cinsiyet Seçin</Text>
              <Pressable onPress={() => setShowGenderModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            {genderOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.genderOption}
                onPress={() => {
                  setFormData({ ...formData, gender: option.value });
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.genderOptionText}>{option.label}</Text>
                {formData.gender === option.value && (
                  <Ionicons name="checkmark" size={20} color="#06b6d4" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  profileImageSection: {
    alignItems: 'center' as const,
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden' as const,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#06b6d4',
  },
  profileImage: {
    width: 120,
    height: 120,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeImageText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top' as const,
  },
  personalInfoButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  personalInfoContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  personalInfoLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  personalInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  personalInfoTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#374151',
  },
  personalInfoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  socialSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 16,
  },
  socialField: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  socialFieldLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: 100,
  },
  socialFieldLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  socialInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  genderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  genderButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  saveButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  genderOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  genderOptionText: {
    fontSize: 16,
    color: '#374151',
  },
};
