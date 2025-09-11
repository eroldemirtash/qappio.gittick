import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek uygulamada Supabase'den çekilecek
      const mockConversations = [
        {
          id: '1',
          user: {
            id: '1',
            name: 'Ahmet Yılmaz',
            username: '@ahmet_yilmaz',
            avatar: 'https://via.placeholder.com/50',
            isOnline: true,
          },
          lastMessage: {
            text: 'Harika bir görev paylaştın!',
            timestamp: '2 saat önce',
            isRead: false,
          },
          unreadCount: 2,
        },
        {
          id: '2',
          user: {
            id: '2',
            name: 'Zeynep Kaya',
            username: '@zeynep_kaya',
            avatar: 'https://via.placeholder.com/50',
            isOnline: false,
          },
          lastMessage: {
            text: 'Teşekkürler, sen de çok güzel paylaşımlar yapıyorsun',
            timestamp: '5 saat önce',
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: '3',
          user: {
            id: '3',
            name: 'Coca-Cola Türkiye',
            username: '@coca_cola_tr',
            avatar: 'https://via.placeholder.com/50',
            isOnline: true,
            isVerified: true,
          },
          lastMessage: {
            text: 'Yeni görevimizi beğendin mi?',
            timestamp: '1 gün önce',
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: '4',
          user: {
            id: '4',
            name: 'Mehmet Demir',
            username: '@mehmet_demir',
            avatar: 'https://via.placeholder.com/50',
            isOnline: false,
          },
          lastMessage: {
            text: 'Görüşürüz!',
            timestamp: '2 gün önce',
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: '5',
          user: {
            id: '5',
            name: 'Ayşe Özkan',
            username: '@ayse_ozkan',
            avatar: 'https://via.placeholder.com/50',
            isOnline: true,
          },
          lastMessage: {
            text: 'Çok güzel bir fotoğraf çekmişsin',
            timestamp: '3 gün önce',
            isRead: false,
          },
          unreadCount: 1,
        },
      ];
      setConversations(mockConversations);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ConversationItem = ({ conversation }: { conversation: any }) => (
    <Pressable 
      style={styles.conversationItem}
      onPress={() => router.push(`/messages/${conversation.id}`)}
    >
      <View style={styles.conversationLeft}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: conversation.user.avatar }} style={styles.avatar} />
          {conversation.user.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{conversation.user.name}</Text>
            {conversation.user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#06b6d4" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage.text}
          </Text>
        </View>
      </View>
      <View style={styles.conversationRight}>
        <Text style={styles.timestamp}>{conversation.lastMessage.timestamp}</Text>
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
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
            placeholder="Mesajlarda ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'Arama sonucu bulunamadı' : 'Henüz mesajın yok'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() 
                ? 'Farklı anahtar kelimeler deneyin'
                : 'İnsanlarla sohbet etmeye başla!'
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
  },
  conversationRight: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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