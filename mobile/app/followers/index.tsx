import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { getLevelColor } from '@/src/lib/levels';

export default function FollowersScreen() {
  const router = useRouter();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFollowers, setFilteredFollowers] = useState<any[]>([]);

  useEffect(() => {
    fetchFollowers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = followers.filter(follower => 
        follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowers(filtered);
    } else {
      setFilteredFollowers(followers);
    }
  }, [searchQuery, followers]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek uygulamada Supabase'den çekilecek
      const mockFollowers = [
        {
          id: '1',
          username: '@ahmet_yilmaz',
          name: 'Ahmet Yılmaz',
          avatar: 'https://via.placeholder.com/50',
          isFollowing: false,
          level: 'Seeker',
        },
        {
          id: '2',
          username: '@zeynep_kaya',
          name: 'Zeynep Kaya',
          avatar: 'https://via.placeholder.com/50',
          isFollowing: true,
          level: 'Crafter',
        },
        {
          id: '3',
          username: '@mehmet_demir',
          name: 'Mehmet Demir',
          avatar: 'https://via.placeholder.com/50',
          isFollowing: false,
          level: 'Snapper',
        },
        {
          id: '4',
          username: '@ayse_ozkan',
          name: 'Ayşe Özkan',
          avatar: 'https://via.placeholder.com/50',
          isFollowing: true,
          level: 'Viralist',
        },
        {
          id: '5',
          username: '@can_arslan',
          name: 'Can Arslan',
          avatar: 'https://via.placeholder.com/50',
          isFollowing: false,
          level: 'Qappian',
        },
      ];
      setFollowers(mockFollowers);
      setFilteredFollowers(mockFollowers);
    } catch (error) {
      console.error('Takipçiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (userId: string) => {
    setFollowers(prev => 
      prev.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
    setFilteredFollowers(prev => 
      prev.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
  };


  const FollowerItem = ({ follower }: { follower: any }) => (
    <View style={styles.followerItem}>
      <View style={styles.followerLeft}>
        <View style={[styles.avatarContainer, { borderColor: getLevelColor(follower.level) }]}>
          <Image source={{ uri: follower.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.followerInfo}>
          <Text style={styles.followerName}>{follower.name}</Text>
          <Text style={styles.followerUsername}>{follower.username}</Text>
        </View>
      </View>
      <Pressable
        style={[
          styles.followButton,
          follower.isFollowing ? styles.followingButton : styles.notFollowingButton
        ]}
        onPress={() => handleFollowToggle(follower.id)}
      >
        <Text style={[
          styles.followButtonText,
          follower.isFollowing ? styles.followingButtonText : styles.notFollowingButtonText
        ]}>
          {follower.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
        </Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Takipçiler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Takipçiler</Text>
        <Pressable 
          style={styles.searchButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color="#1e293b" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredFollowers.length > 0 ? (
          filteredFollowers.map((follower) => (
            <FollowerItem key={follower.id} follower={follower} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'Arama sonucu bulunamadı' : 'Henüz takipçin yok'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() 
                ? 'Farklı anahtar kelimeler deneyin'
                : 'Gönderilerini paylaşarak daha fazla kişiye ulaşabilirsin!'
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
              <Text style={styles.modalTitle}>Takipçi Ara</Text>
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
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  followerLeft: {
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
  followerInfo: {
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  followerUsername: {
    fontSize: 14,
    color: '#64748b',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#e2e8f0',
  },
  notFollowingButton: {
    backgroundColor: '#06b6d4',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#64748b',
  },
  notFollowingButtonText: {
    color: '#ffffff',
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
