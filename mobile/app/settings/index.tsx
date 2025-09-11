import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [qappishModalVisible, setQappishModalVisible] = useState(false);
  const [brandSuggestion, setBrandSuggestion] = useState('');
  const [qappishSuggestion, setQappishSuggestion] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleProfileSettings = () => {
    router.push('/profile/edit');
  };

  const handleSuggestBrand = () => {
    setBrandModalVisible(true);
  };

  const handleSuggestQappish = () => {
    setQappishModalVisible(true);
  };

  const handleSubmitBrandSuggestion = () => {
    if (brandSuggestion.trim()) {
      Alert.alert('Teşekkürler!', 'Marka öneriniz başarıyla gönderildi.');
      setBrandSuggestion('');
      setBrandModalVisible(false);
    } else {
      Alert.alert('Hata', 'Lütfen marka önerinizi yazın.');
    }
  };

  const handleSubmitQappishSuggestion = () => {
    if (qappishSuggestion.trim()) {
      Alert.alert('Teşekkürler!', 'Qappish öneriniz başarıyla gönderildi.');
      setQappishSuggestion('');
      setQappishModalVisible(false);
    } else {
      Alert.alert('Hata', 'Lütfen Qappish önerinizi yazın.');
    }
  };

  const handleReportProblem = () => {
    Alert.alert('Sorun Bildir', 'Sorun bildirme özelliği yakında eklenecek!');
  };

  const handleHelpCenter = () => {
    Alert.alert('Yardım Merkezi', 'Yardım merkezi özelliği yakında eklenecek!');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Gizlilik İlkesi', 'Gizlilik ilkesi özelliği yakında eklenecek!');
  };

  const handleUserAgreement = () => {
    Alert.alert('Kullanıcı Sözleşmesi', 'Kullanıcı sözleşmesi özelliği yakında eklenecek!');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    onPress, 
    rightComponent, 
    isLast = false 
  }: {
    icon: string;
    title: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    isLast?: boolean;
  }) => (
    <Pressable 
      style={[styles.settingItem, isLast && styles.lastSettingItem]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={20} color="#475569" />
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {rightComponent || (onPress && <Ionicons name="chevron-forward" size={16} color="#94a3b8" />)}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hesap Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="chatbubble-outline"
              title="Yorumlar"
              rightComponent={
                <Switch
                  value={commentsEnabled}
                  onValueChange={setCommentsEnabled}
                  trackColor={{ false: '#e2e8f0', true: '#06b6d4' }}
                  thumbColor={commentsEnabled ? '#ffffff' : '#ffffff'}
                />
              }
            />
            <SettingItem
              icon="notifications-outline"
              title="Bildirimler"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#e2e8f0', true: '#06b6d4' }}
                  thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
                />
              }
            />
            <SettingItem
              icon="person-outline"
              title="Profil Ayarları"
              onPress={handleProfileSettings}
            />
            <SettingItem
              icon="business-outline"
              title="Marka Öner"
              onPress={handleSuggestBrand}
            />
            <SettingItem
              icon="bulb-outline"
              title="Qappish Öner"
              onPress={handleSuggestQappish}
            />
            <SettingItem
              icon="log-out-outline"
              title="Çıkış"
              onPress={handleLogout}
              isLast={true}
            />
          </View>
        </View>

        {/* Destek Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="warning-outline"
              title="Sorun Bildir"
              onPress={handleReportProblem}
            />
            <SettingItem
              icon="help-circle-outline"
              title="Yardım Merkezi"
              onPress={handleHelpCenter}
            />
            <SettingItem
              icon="shield-outline"
              title="Gizlilik İlkesi"
              onPress={handlePrivacyPolicy}
            />
            <SettingItem
              icon="document-text-outline"
              title="Kullanıcı Sözleşmesi"
              onPress={handleUserAgreement}
              isLast={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* Marka Öner Modal */}
      <Modal
        visible={brandModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Marka Öner</Text>
              <Pressable onPress={() => setBrandModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            
            <Text style={styles.modalDescription}>
              Hangi markanın Qappio'da yer almasını istiyorsunuz?
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Marka adını yazın..."
              placeholderTextColor="#94a3b8"
              value={brandSuggestion}
              onChangeText={setBrandSuggestion}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setBrandModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>İptal</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitBrandSuggestion}
              >
                <Text style={styles.modalButtonPrimaryText}>Gönder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Qappish Öner Modal */}
      <Modal
        visible={qappishModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQappishModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Qappish Öner</Text>
              <Pressable onPress={() => setQappishModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            
            <Text style={styles.modalDescription}>
              Hangi Qappish özelliğinin eklenmesini istiyorsunuz?
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Qappish önerinizi yazın..."
              placeholderTextColor="#94a3b8"
              value={qappishSuggestion}
              onChangeText={setQappishSuggestion}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setQappishModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>İptal</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitQappishSuggestion}
              >
                <Text style={styles.modalButtonPrimaryText}>Gönder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06b6d4',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalButtonPrimary: {
    backgroundColor: '#06b6d4',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});