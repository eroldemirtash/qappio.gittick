import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek uygulamada Supabase'den çekilecek
      const mockNotifications = [
        {
          id: '1',
          type: 'like',
          user: {
            id: '1',
            name: 'Ahmet Yılmaz',
            username: '@ahmet_yilmaz',
            avatar: 'https://via.placeholder.com/40',
          },
          content: 'Gönderini beğendi',
          post: {
            id: '1',
            media_url: 'https://via.placeholder.com/60',
          },
          timestamp: '5 dakika önce',
          isRead: false,
        },
        {
          id: '2',
          type: 'comment',
          user: {
            id: '2',
            name: 'Zeynep Kaya',
            username: '@zeynep_kaya',
            avatar: 'https://via.placeholder.com/40',
          },
          content: 'Gönderine yorum yaptı: "Harika bir paylaşım!"',
          post: {
            id: '2',
            media_url: 'https://via.placeholder.com/60',
          },
          timestamp: '1 saat önce',
          isRead: false,
        },
        {
          id: '3',
          type: 'follow',
          user: {
            id: '3',
            name: 'Mehmet Demir',
            username: '@mehmet_demir',
            avatar: 'https://via.placeholder.com/40',
          },
          content: 'Seni takip etmeye başladı',
          timestamp: '2 saat önce',
          isRead: true,
        },
        {
          id: '4',
          type: 'mission',
          user: {
            id: '4',
            name: 'Coca-Cola Türkiye',
            username: '@coca_cola_tr',
            avatar: 'https://via.placeholder.com/40',
            isVerified: true,
          },
          content: 'Yeni görev yayınladı: "Coca-Cola ile Yaz"',
          mission: {
            id: '1',
            title: 'Coca-Cola ile Yaz',
            cover_url: 'https://via.placeholder.com/60',
          },
          timestamp: '3 saat önce',
          isRead: true,
        },
        {
          id: '5',
          type: 'reward',
          user: {
            id: '5',
            name: 'Qappio',
            username: '@qappio',
            avatar: 'https://via.placeholder.com/40',
            isVerified: true,
          },
          content: 'Tebrikler! 100 QP kazandın',
          timestamp: '1 gün önce',
          isRead: true,
        },
        {
          id: '6',
          type: 'share',
          user: {
            id: '6',
            name: 'Ayşe Özkan',
            username: '@ayse_ozkan',
            avatar: 'https://via.placeholder.com/40',
          },
          content: 'Gönderini paylaştı',
          post: {
            id: '3',
            media_url: 'https://via.placeholder.com/60',
          },
          timestamp: '2 gün önce',
          isRead: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'mission':
        return 'star';
      case 'reward':
        return 'gift';
      case 'share':
        return 'share';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      case 'follow':
        return '#10b981';
      case 'mission':
        return '#f59e0b';
      case 'reward':
        return '#8b5cf6';
      case 'share':
        return '#06b6d4';
      default:
        return '#64748b';
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => (
    <Pressable 
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => {
        // Bildirime tıklandığında ilgili sayfaya git
        if (notification.type === 'mission' && notification.mission) {
          router.push(`/missions/${notification.mission.id}`);
        } else if (notification.post) {
          // Post detay sayfasına git
          console.log('Post detay sayfasına git:', notification.post.id);
        }
      }}
    >
      <View style={styles.notificationLeft}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            color={getNotificationColor(notification.type)} 
          />
        </View>
        <Image source={{ uri: notification.user.avatar }} style={styles.avatar} />
        <View style={styles.notificationContent}>
          <View style={styles.contentRow}>
            <Text style={styles.userName}>{notification.user.name}</Text>
            {notification.user.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#06b6d4" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.notificationText} numberOfLines={2}>
            {notification.content}
          </Text>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
        </View>
      </View>
      <View style={styles.notificationRight}>
        {notification.post && (
          <Image source={{ uri: notification.post.media_url }} style={styles.postImage} />
        )}
        {notification.mission && (
          <Image source={{ uri: notification.mission.cover_url }} style={styles.postImage} />
        )}
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bildirimlerde ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'Arama sonucu bulunamadı' : 'Henüz bildirimin yok'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() 
                ? 'Farklı anahtar kelimeler deneyin'
                : 'Aktiviteleriniz burada görünecek!'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationRight: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});