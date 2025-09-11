import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image, Keyboard, Dimensions, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    fetchChatData();
  }, [id]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      
      // Mock data - gerçekçi avatar URL'leri
      const mockUsers = [
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          username: '@ahmet_yilmaz',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          isOnline: true,
          isVerified: false,
        },
        {
          id: '2',
          name: 'Zeynep Kaya',
          username: '@zeynep_kaya',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          isOnline: false,
          isVerified: true,
        },
        {
          id: '3',
          name: 'Mehmet Demir',
          username: '@mehmet_demir',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          isOnline: true,
          isVerified: false,
        }
      ];

      // ID'ye göre kullanıcı seç veya varsayılan
      const selectedUser = mockUsers.find(u => u.id === id) || mockUsers[0];
      console.log('Selected user:', selectedUser);
      setUser(selectedUser);

      const mockMessages = [
        {
          id: '1',
          text: 'Merhaba! Nasılsın?',
          senderId: id,
          timestamp: '10:30',
          isRead: true,
        },
        {
          id: '2',
          text: 'İyiyim teşekkürler, sen nasılsın?',
          senderId: 'current_user',
          timestamp: '10:32',
          isRead: true,
        },
        {
          id: '3',
          text: 'Harika bir görev paylaştın!',
          senderId: id,
          timestamp: '10:35',
          isRead: true,
        },
        {
          id: '4',
          text: 'Teşekkürler! Sen de çok güzel paylaşımlar yapıyorsun',
          senderId: 'current_user',
          timestamp: '10:36',
          isRead: true,
        },
        {
          id: '5',
          text: 'Yeni görevlerde görüşürüz!',
          senderId: id,
          timestamp: '10:40',
          isRead: false,
        },
      ];

      setUser(mockUser);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Chat verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        senderId: 'current_user',
        timestamp: new Date().toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isRead: false,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const MessageBubble = ({ message }: { message: any }) => {
    const isCurrentUser = message.senderId === 'current_user';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {message.text}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isCurrentUser ? styles.currentUserTime : styles.otherUserTime
        ]}>
          {message.timestamp}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <View style={styles.headerUser}>
          <Image 
            source={{ uri: user?.avatar }} 
            style={styles.headerAvatar}
            defaultSource={{ uri: 'https://via.placeholder.com/50' }}
            onError={() => console.log('Avatar yüklenemedi:', user?.avatar)}
          />
          <View style={styles.headerUserInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerUserName}>{user?.name}</Text>
              {user?.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#06b6d4" />
              )}
            </View>
            <Text style={styles.headerUserStatus}>
              {user?.isOnline ? 'Çevrimiçi' : 'Son görülme: 2 saat önce'}
            </Text>
          </View>
        </View>
        <Pressable 
          style={styles.moreButton}
          onPress={() => setShowMoreModal(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#1e293b" />
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={[
          styles.messagesContainer,
          { 
            height: keyboardHeight > 0 
              ? screenHeight - keyboardHeight - 120 - insets.top 
              : screenHeight - 120 - insets.top 
          }
        ]}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      {/* Message Input - Fixed at bottom */}
      <View style={[
        styles.inputContainer, 
        { 
          bottom: keyboardHeight > 0 ? keyboardHeight : 0,
          paddingBottom: keyboardHeight > 0 ? 12 : insets.bottom + 12
        }
      ]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.messageInput}
            placeholder="Mesaj yazın..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable 
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? '#ffffff' : '#94a3b8'} 
            />
          </Pressable>
        </View>
      </View>

      {/* More Options Modal */}
      <Modal
        visible={showMoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoreModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMoreModal(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seçenekler</Text>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setShowMoreModal(false)}
              >
                <Ionicons name="close" size={24} color="#1e293b" />
              </Pressable>
            </View>
            
            <Pressable style={styles.modalOption}>
              <Ionicons name="flag" size={20} color="#ef4444" />
              <Text style={styles.modalOptionText}>Şikayet Et</Text>
            </Pressable>
            
            <Pressable style={styles.modalOption}>
              <Ionicons name="ban" size={20} color="#ef4444" />
              <Text style={styles.modalOptionText}>Engelle</Text>
            </Pressable>
            
            <Pressable style={styles.modalOption}>
              <Ionicons name="notifications-off" size={20} color="#6b7280" />
              <Text style={styles.modalOptionText}>Bildirimleri Kapat</Text>
            </Pressable>
            
            <Pressable style={styles.modalOption}>
              <Ionicons name="archive" size={20} color="#6b7280" />
              <Text style={styles.modalOptionText}>Arşivle</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUserInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 4,
  },
  headerUserStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#06b6d4',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTime: {
    color: '#64748b',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#94a3b8',
    textAlign: 'left',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#06b6d4',
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0',
  },
});
