import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { getLevelColor } from '@/src/lib/levels';

export default function FollowingScreen() {
  const router = useRouter();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFollowing, setFilteredFollowing] = useState<any[]>([]);

  useEffect(() => {
    fetchFollowing();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = following.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowing(filtered);
    } else {
      setFilteredFollowing(following);
    }
  }, [searchQuery, following]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek uygulamada Supabase'den çekilecek
      const mockFollowing = [
        {
          id: '1',
          username: '@coca_cola_tr',
          name: 'Coca-Cola Türkiye',
          avatar: 'https://via.placeholder.com/50',
          isVerified: true,
          level: 'Brand',
        },
        {
          id: '2',
          username: '@nike_tr',
          name: 'Nike Türkiye',
          avatar: 'https://via.placeholder.com/50',
          isVerified: true,
          level: 'Brand',
        },
        {
          id: '3',
          username: '@elena_rodriguez',
          name: 'Elena Rodriguez',
          avatar: 'https://via.placeholder.com/50',
          isVerified: false,
          level: 'Viralist',
        },
        {
          id: '4',
          username: '@tech_reviewer',
          name: 'Tech Reviewer',
          avatar: 'https://via.placeholder.com/50',
          isVerified: false,
          level: 'Crafter',
        },
        {
          id: '5',
          username: '@fashion_blogger',
          name: 'Fashion Blogger',
          avatar: 'https://via.placeholder.com/50',
          isVerified: false,
          level: 'Seeker',
        },
      ];
      setFollowing(mockFollowing);
      setFilteredFollowing(mockFollowing);
    } catch (error) {
      console.error('Takip edilenler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = (userId: string) => {
    setFollowing(prev => prev.filter(user => user.id !== userId));
    setFilteredFollowing(prev => prev.filter(user => user.id !== userId));
  };


  const FollowingItem = ({ user }: { user: any }) => (
    <View style={styles.followingItem}>
      <View style={styles.followingLeft}>
        <View style={[styles.avatarContainer, { borderColor: getLevelColor(user.level) }]}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.followingInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.followingName}>{user.name}</Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#06b6d4" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.followingUsername}>{user.username}</Text>
        </View>
      </View>
      <Pressable
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(user.id)}
      >
        <Text style={styles.unfollowButtonText}>Takipten Çık</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Takip edilenler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Takip Edilenler</Text>
        <Pressable 
          style={styles.searchButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color="#1e293b" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredFollowing.length > 0 ? (
          filteredFollowing.map((user) => (
            <FollowingItem key={user.id} user={user} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-add-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'Arama sonucu bulunamadı' : 'Henüz kimseyi takip etmiyorsun'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() 
                ? 'Farklı anahtar kelimeler deneyin'
                : 'İlginç kişileri ve markaları keşfetmeye başla!'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Takip Edilen Ara</Text>
              <Pressable onPress={() => setSearchModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="İsim veya kullanıcı adı ara..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setSearchQuery('');
                  setSearchModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Temizle</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setSearchModalVisible(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Ara</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 3,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  searchButton: {
    padding: 8,
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
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  followingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    padding: 2,
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },
  followingInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  followingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  followingUsername: {
    fontSize: 14,
    color: '#64748b',
  },
  unfollowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    minWidth: 100,
    alignItems: 'center',
  },
  unfollowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
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
