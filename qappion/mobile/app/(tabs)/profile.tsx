import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/useAuth';
import { useRouter } from 'expo-router';
import { card3DStyles } from '@/src/theme/card3D';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappio', headerTitleAlign: 'center' });
  }, [navigation]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileContent}>
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
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#e5e7eb" />
            <Text style={styles.menuText}>Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={styles.chevron} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#e5e7eb" />
            <Text style={styles.menuText}>Yardım</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={styles.chevron} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color="#e5e7eb" />
            <Text style={styles.menuText}>Hakkında</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={styles.chevron} />
          </Pressable>

          <Pressable 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    width: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  profileContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    ...card3DStyles.card3DProfile,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
});
