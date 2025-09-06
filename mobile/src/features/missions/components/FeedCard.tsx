import React, { useState } from 'react';
import { View, Text, Image, Pressable, Share, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FeedCardProps {
  post: any;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onShare: (postId: string) => void;
  onMoreOptions?: (post: any) => void;
  isGridView?: boolean;
}

export default function FeedCard({ post, onLike, onComment, onShare, onMoreOptions, isGridView = false }: FeedCardProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Qappio'da bu gönderiyi gör: ${post.caption}`,
        url: `qappio://post/${post.id}`,
      });
      onShare(post.id);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleMoreOptions = () => {
    setModalVisible(true);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const handleCommentPress = () => {
    Alert.prompt(
      'Yorum Yap',
      'Yorumunuzu yazın:',
      (text) => {
        if (text && text.trim()) {
          onComment(post.id, text.trim());
        }
      }
    );
  };

  const handleMissionTitle = () => {
    if (post.mission?.id) {
      router.push(`/missions/${post.mission.id}`);
    }
  };

  const getLevelColor = (levelName: string) => {
    switch (levelName) {
      case 'Snapper': return '#fbbf24'; // Yellow
      case 'Seeker': return '#10b981'; // Green
      case 'Crafter': return '#8b5cf6'; // Purple
      case 'Viralist': return '#f59e0b'; // Orange
      case 'Qappian': return '#06b6d4'; // Cyan
      default: return '#6b7280'; // Default gray
    }
  };

  // Grid view için basit kart
  if (isGridView) {
    return (
      <View style={styles.gridContainer}>
        {/* Media */}
        {post.media_url && (
          <Image
            source={{ uri: post.media_url }}
            style={styles.gridMedia}
            resizeMode="cover"
          />
        )}

        {/* Brand Logo Overlay */}
        {post.mission?.brand && (
          <View style={styles.gridBrandOverlay}>
            <Image
              source={{ uri: post.mission.brand.logo_url || 'https://via.placeholder.com/16' }}
              style={styles.gridBrandLogo}
            />
            <Text style={styles.gridBrandName}>{post.mission.brand.name}</Text>
          </View>
        )}

        {/* Sponsored By Overlay */}
        {post.is_sponsored && post.sponsor_brand && (
          <View style={styles.gridSponsoredOverlay}>
            <Text style={styles.gridSponsoredByText}>Sponsored by</Text>
            <Image
              source={{ uri: post.sponsor_brand.logo_url || 'https://via.placeholder.com/12' }}
              style={styles.gridSponsorLogo}
            />
            <Text style={styles.gridSponsorText}>{post.sponsor_brand.name}</Text>
          </View>
        )}

        {/* User Info */}
        <View style={styles.gridUserInfo}>
          <View style={[styles.gridAvatarContainer, { borderColor: getLevelColor(post.user?.level_name || 'Snapper') }]}>
            <Image
              source={{ uri: post.user?.avatar_url || 'https://via.placeholder.com/32' }}
              style={styles.gridAvatar}
            />
          </View>
          <View style={styles.gridUserDetails}>
            <Text style={styles.gridUsername}>@{post.user?.display_name}</Text>
            <View style={[styles.gridLevelBadge, { backgroundColor: getLevelColor(post.user?.level_name || 'Snapper') }]}>
              <Text style={styles.gridLevelText}>
                {post.user?.level_name || 'Snapper'}
              </Text>
            </View>
          </View>
        </View>

        {/* Mission Title - Clickable */}
        {post.mission && (
          <View style={styles.gridMissionSection}>
            <Pressable onPress={handleMissionTitle} style={styles.gridMissionButton}>
              <Text style={styles.gridMissionTitle}>{post.mission.title}</Text>
            </Pressable>
          </View>
        )}

        {/* Like Count */}
        <View style={styles.gridLikeSection}>
          <Pressable onPress={handleLike} style={styles.gridLikeButton}>
            <Ionicons 
              name="heart" 
              size={16} 
              color="#ef4444" 
            />
            <Text style={[styles.gridLikeText, { color: "#ef4444" }]}>{likeCount}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { borderColor: getLevelColor(post.user?.level_name || 'Snapper') }]}>
            <Image
              source={{ uri: post.user?.avatar_url || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>@{post.user?.display_name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(post.user?.level_name || 'Snapper') }]}>
              <Text style={styles.levelText}>
                {post.user?.level_name || 'Snapper'}
              </Text>
            </View>
          </View>
        </View>
        <Pressable onPress={handleMoreOptions} style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </Pressable>
      </View>

      {/* Media */}
      {post.media_url && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.media_url }}
            style={styles.media}
            resizeMode="cover"
          />
          
          {/* Brand Logo Overlay - Top Left */}
          {post.mission?.brand && (
            <View style={styles.brandOverlay}>
              <Image
                source={{ uri: post.mission.brand.logo_url || 'https://via.placeholder.com/24' }}
                style={styles.brandLogo}
              />
              <Text style={styles.brandName}>{post.mission.brand.name}</Text>
            </View>
          )}
          
          {/* Sponsored By Overlay - Top Right */}
          {post.is_sponsored && post.sponsor_brand && (
            <View style={styles.sponsoredOverlay}>
              <Text style={styles.sponsoredByText}>Sponsored by</Text>
              <Image
                source={{ uri: post.sponsor_brand.logo_url || 'https://picsum.photos/16/16?random=99' }}
                style={styles.sponsorLogo}
              />
              <Text style={styles.sponsorText}>{post.sponsor_brand.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={handleLike} style={styles.actionButton}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#ef4444" : "#6b7280"} 
            />
            <Text style={styles.actionText}>{likeCount}</Text>
          </Pressable>
          <Pressable onPress={handleCommentPress} style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
            <Text style={styles.actionText}>{post.comment_count || 0}</Text>
          </Pressable>
          <Pressable onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={24} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      {/* Mission Info */}
      {post.mission && (
        <View style={styles.missionInfo}>
          <View style={styles.missionTag}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Image
              source={{ uri: post.mission.brand?.logo_url || 'https://via.placeholder.com/20' }}
              style={styles.missionBrandLogo}
            />
            <Text style={styles.missionBrandName}>{post.mission.brand?.name}</Text>
            <Text style={styles.missionSeparator}>:</Text>
            <Pressable onPress={handleMissionTitle}>
              <Text style={styles.missionTitle}>{post.mission.title}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.caption}>
          <Text style={styles.captionText}>
            <Text style={styles.captionUsername}>@{post.user?.display_name}</Text>
            {' '}{post.caption}
          </Text>
        </View>
      )}

      {/* Latest Comment */}
      {post.latest_comment && (
        <View style={styles.comment}>
          <Text style={styles.commentText}>
            <Text style={styles.commentUsername}>@{post.latest_comment.username}</Text>
            {' '}{post.latest_comment.text}
          </Text>
        </View>
      )}

      {/* More Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable 
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                handleShare();
              }}
            >
              <Ionicons name="share-outline" size={20} color="#6b7280" />
              <Text style={styles.modalOptionText}>Paylaş</Text>
            </Pressable>
            <Pressable 
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                Alert.alert('Şikayet', 'Bu gönderi şikayet edildi');
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#ef4444" />
              <Text style={[styles.modalOptionText, { color: '#ef4444' }]}>Şikayet Et</Text>
            </Pressable>
            <Pressable 
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                Alert.alert('Engelle', 'Bu kullanıcı engellendi');
              }}
            >
              <Ionicons name="ban-outline" size={20} color="#ef4444" />
              <Text style={[styles.modalOptionText, { color: '#ef4444' }]}>Engelle</Text>
            </Pressable>
            <Pressable 
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>İptal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 8,
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    padding: 2,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
    minWidth: 60,
  },
  levelText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  sponsorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  sponsoredByText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sponsorLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  sponsorText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moreButton: {
    padding: 4,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  brandOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  sponsoredOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
  missionInfo: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    marginTop: 8,
  },
  missionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  missionBrandLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 2,
    marginRight: 8,
  },
  missionBrandName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  missionSeparator: {
    color: '#6b7280',
    fontSize: 14,
    marginHorizontal: 4,
  },
  missionTitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  caption: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  captionText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
  },
  comment: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  commentText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  commentUsername: {
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Grid View Styles
  gridContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    margin: 2,
  },
  gridMedia: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridBrandOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  gridBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  gridBrandName: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  gridUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  gridAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    padding: 1,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  gridUserDetails: {
    flex: 1,
  },
  gridUsername: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 11,
  },
  gridLevelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    alignSelf: 'flex-start',
    minWidth: 40,
  },
  gridLevelText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
  },
  gridLikeSection: {
    padding: 8,
    paddingTop: 0,
  },
  gridLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLikeText: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  gridMissionSection: {
    padding: 8,
    paddingTop: 0,
  },
  gridMissionButton: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridMissionTitle: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Grid Sponsored Styles
  gridSponsoredOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  gridSponsoredByText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '500',
    marginRight: 3,
  },
  gridSponsorLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 3,
  },
  gridSponsorText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
});
