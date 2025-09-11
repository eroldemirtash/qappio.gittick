import React, { useState, useLayoutEffect, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/store/useAuth';
import { supabase } from '@/src/lib/supabase';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });

  const [isLoading, setIsLoading] = useState(false);

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
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
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
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) throw result.error;

      Alert.alert('Başarılı', 'Kişisel bilgileriniz güncellendi!');
      router.back();
    } catch (error) {
      console.error('Personal info update error:', error);
      Alert.alert('Hata', 'Bilgiler güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
        </View>
        <Text style={styles.infoTitle}>Ödül Gönderimi İçin</Text>
        <Text style={styles.infoText}>
          Bu bilgiler sadece ödül veya ürün gönderimi için kullanılacaktır. 
          Diğer kullanıcılar bu bilgileri göremez.
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Full Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Ad Soyad *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            placeholder="Ad Soyad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>E-posta Adresi *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="ornek@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Telefon Numarası *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+90 5XX XXX XX XX"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        {/* Address Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Adres *</Text>
          <TextInput
            style={[styles.textInput, styles.addressInput]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Tam adresinizi girin"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Warning Card */}
      <View style={styles.warningCard}>
        <View style={styles.warningIcon}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
        </View>
        <Text style={styles.warningText}>
          Lütfen bilgileri doğru girdiğinizden emin olun. 
          Yanlış bilgiler nedeniyle ödül gönderimi yapılamaz.
        </Text>
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
  infoCard: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
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
  addressInput: {
    height: 80,
    textAlignVertical: 'top' as const,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
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
};
