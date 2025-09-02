import { useState } from 'react';
import { View, Text, Image, Pressable, Modal, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedItem } from '../types';
import { useUI } from '@/src/store/useUI';

interface FeedCardProps {
  item: FeedItem;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const levelColors: Record<string, string> = {
  seeker: '#10b981',
  explorer: '#3b82f6',
  pathfinder: '#a855f7',
  maverick: '#ef4444',
  legend: '#f59e0b'
};

export default function FeedCard({ item, onLike, onComment, onShare }: FeedCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { showToast } = useUI();

  const handleLike = () => {
    onLike(item.id);
    showToast('Beğenildi!', 'success');
  };

  const handleComment = () => {
    onComment(item.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Qappio'da bu görevi gör: ${item.mission?.title}`,
        url: `qappio://mission/${item.mission?.id}`,
      });
      onShare(item.id);
    } catch (error) {
      showToast('Paylaşım hatası', 'error');
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    showToast(`${action} özelliği yakında gelecek`, 'info');
  };

  return (
    <View className="bg-card border-b border-border">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          {/* Avatar with level border */}
          <View 
            className="w-10 h-10 rounded-full border-2 mr-3"
            style={{ borderColor: levelColors[item.user?.level_name || 'seeker'] }}
          >
            <Image
              source={{ 
                uri: item.user?.avatar_url || 'https://via.placeholder.com/40x40/94a3b8/ffffff?text=U'
              }}
              className="w-full h-full rounded-full"
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-text font-semibold">@{item.user?.display_name}</Text>
            <View className="flex-row items-center">
              <View 
                className="px-2 py-1 rounded-full mr-2"
                style={{ backgroundColor: levelColors[item.user?.level_name || 'seeker'] }}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.user?.level_name?.toUpperCase() || 'SEEKER'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Brand and Menu */}
        <View className="flex-row items-center">
          {item.mission?.brand && (
            <View className="flex-row items-center mr-3">
              <Image
                source={{ uri: item.mission.brand.logo_url || 'https://via.placeholder.com/20x20' }}
                className="w-5 h-5 rounded mr-1"
              />
              <Text className="text-sub text-sm">{item.mission.brand.name}</Text>
            </View>
          )}
          
          <Pressable onPress={() => setShowMenu(true)} className="p-1">
            <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Sponsor Badge */}
      {item.is_sponsored && item.sponsor_brand && (
        <View className="px-4 pb-2">
          <View className="flex-row items-center bg-brand/10 px-3 py-2 rounded-lg">
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text className="text-brand font-semibold ml-2">
              Sponsor: {item.sponsor_brand.name}
            </Text>
          </View>
        </View>
      )}

      {/* Media */}
      {item.media_url && (
        <View className="aspect-square bg-border">
          <Image
            source={{ uri: item.media_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center space-x-6">
          <Pressable onPress={handleLike} className="flex-row items-center">
            <Ionicons name="heart-outline" size={24} color="#e5e7eb" />
            <Text className="text-text ml-2">{item.like_count || 0}</Text>
          </Pressable>
          
          <Pressable onPress={handleComment} className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={24} color="#e5e7eb" />
            <Text className="text-text ml-2">{item.comment_count || 0}</Text>
          </Pressable>
          
          <Pressable onPress={handleShare} className="flex-row items-center">
            <Ionicons name="paper-plane-outline" size={24} color="#e5e7eb" />
            <Text className="text-text ml-2">Paylaş</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pb-4">
        <Text className="text-text font-semibold mb-1">
          {item.mission?.brand?.name} • {item.mission?.title}
        </Text>
        
        {item.caption && (
          <Text className="text-text mb-2">{item.caption}</Text>
        )}
        
        {item.latest_comment && (
          <Text className="text-sub text-sm">
            <Text className="font-semibold">@{item.latest_comment.username}</Text> {item.latest_comment.text}
          </Text>
        )}
      </View>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowMenu(false)}
        >
          <View className="bg-card rounded-xl p-4 w-64">
            <Pressable 
              className="py-3 border-b border-border"
              onPress={() => handleMenuAction('Şikayet')}
            >
              <Text className="text-text text-center">Şikayet Et</Text>
            </Pressable>
            <Pressable 
              className="py-3 border-b border-border"
              onPress={() => handleMenuAction('Sessize Al')}
            >
              <Text className="text-text text-center">Sessize Al</Text>
            </Pressable>
            <Pressable 
              className="py-3 border-b border-border"
              onPress={() => handleMenuAction('Engelle')}
            >
              <Text className="text-text text-center">Engelle</Text>
            </Pressable>
            <Pressable 
              className="py-3"
              onPress={() => handleMenuAction('Link Kopyala')}
            >
              <Text className="text-text text-center">Link Kopyala</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
