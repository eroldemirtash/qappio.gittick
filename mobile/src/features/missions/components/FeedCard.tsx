import React, { useState } from 'react';
import { View, Text, Image, Pressable, Share, StyleSheet, Alert, Modal, Animated, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getLevelColor } from '@/src/lib/levels';

interface FeedCardProps {
  post: any;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onShare: (postId: string) => void;
  onMoreOptions?: (post: any) => void;
  isGridView?: boolean;
  isSelected?: boolean;
}

export default function FeedCard({ post, onLike, onComment, onShare, onMoreOptions, isGridView = false, isSelected = false }: FeedCardProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(post.favorite_count || 0);
  const [cardScale] = useState(new Animated.Value(1));

  const animateButton = (scaleValue: Animated.Value, callback?: () => void) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleBrandPress = () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const raw = post?.mission?.brand_id || post?.mission?.brand?.id || post?.mission?.brandId;
    const nameFallback = post?.mission?.brand?.name;
    const target = uuidRegex.test(String(raw || '')) ? raw : (nameFallback || raw);
    if (target) {
      router.push(`/brands/${encodeURIComponent(String(target))}`);
    }
  };
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

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setFavoriteCount((prev: number) => isFavorited ? prev - 1 : prev + 1);
    // Gerçek uygulamada Supabase'e favori durumu kaydedilecek
    console.log('Favori durumu değişti:', !isFavorited);
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
    setCommentModalVisible(true);
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        username: 'Sen', // Gerçek uygulamada kullanıcı adı çekilecek
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      };
      
      setComments((prev: any[]) => [comment, ...prev]);
      setCommentCount((prev: number) => prev + 1);
      setNewComment('');
      onComment(post.id, newComment.trim());
    }
  };

  const handleMissionTitle = () => {
    if (post.mission?.id) {
      router.push(`/missions/${post.mission.id}`);
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
          <Pressable style={styles.gridBrandOverlay} onPress={() => animateButton(cardScale, handleBrandPress)}>
            <Image
              source={{ uri: post.mission.brand.logo_url || 'https://via.placeholder.com/16' }}
              style={styles.gridBrandLogo}
            />
            <Text style={styles.gridBrandName}>{post.mission.brand.name}</Text>
          </Pressable>
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

        {/* Sponsored By - Below Image */}
        {post.is_sponsored && post.sponsor_brand && (
          <View style={styles.gridSponsoredBelow}>
            <Text style={styles.gridSponsoredByTextBelow}>Sponsored by</Text>
            <Image
              source={{ uri: post.sponsor_brand.logo_url || 'https://via.placeholder.com/12' }}
              style={styles.gridSponsorLogoBelow}
            />
            <Text style={styles.gridSponsorTextBelow}>{post.sponsor_brand.name}</Text>
          </View>
        )}

        {/* Like and Favorite Count */}
        <View style={styles.gridLikeSection}>
          <Pressable 
            onPress={() => animateButton(cardScale, handleLike)} 
            style={styles.gridLikeButton}
          >
            <Ionicons 
              name="heart" 
              size={16} 
              color="#ef4444" 
            />
            <Text style={[styles.gridLikeText, { color: "#ef4444" }]}>{likeCount}</Text>
          </Pressable>
          <Pressable 
            onPress={() => animateButton(cardScale, handleFavorite)} 
            style={styles.gridLikeButton}
          >
            <Ionicons 
              name={isFavorited ? "bookmark" : "bookmark-outline"} 
              size={16} 
              color={isFavorited ? "#fbbf24" : "#6b7280"} 
            />
            <Text style={[styles.gridLikeText, { color: isFavorited ? "#fbbf24" : "#6b7280" }]}>{favoriteCount}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <View style={[styles.container, isSelected && styles.selectedContainer]}>
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
            <Pressable style={styles.brandOverlay} onPress={() => animateButton(cardScale, handleBrandPress)}>
              <Image
                source={{ uri: post.mission.brand.logo_url || 'https://via.placeholder.com/24' }}
                style={styles.brandLogo}
              />
              <Text style={styles.brandName}>{post.mission.brand.name}</Text>
            </Pressable>
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
            <Text style={styles.actionText}>{commentCount}</Text>
          </Pressable>
          <Pressable 
            onPress={() => animateButton(cardScale, handleFavorite)} 
            style={styles.actionButton}
          >
            <Ionicons 
              name={isFavorited ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isFavorited ? "#fbbf24" : "#6b7280"} 
            />
            <Text style={styles.actionText}>{favoriteCount}</Text>
          </Pressable>
          <Pressable 
            onPress={() => animateButton(cardScale, handleShare)} 
            style={styles.actionButton}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      {/* Mission Info */}
      {post.mission && (
        <View style={styles.missionInfo}>
          <View style={styles.missionTag}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Pressable onPress={() => animateButton(cardScale, handleBrandPress)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: post.mission.brand?.logo_url || 'https://via.placeholder.com/20' }}
                style={styles.missionBrandLogo}
              />
              <Text style={styles.missionBrandName}>{post.mission.brand?.name}</Text>
            </Pressable>
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
      {comments.length > 0 && (
        <View style={styles.comment}>
          <Text style={styles.commentText}>
            <Text style={styles.commentUsername}>@{comments[0].username}</Text>
            {' '}{comments[0].text}
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

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentModalOverlay}>
          <View style={styles.commentModalContent}>
            {/* Header */}
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Yorumlar</Text>
              <Pressable 
                style={styles.commentModalCloseButton}
                onPress={() => setCommentModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {comments.map((comment: any) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image 
                    source={{ uri: comment.user_avatar }} 
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUsernameInList}>@{comment.username}</Text>
                      <Text style={styles.commentTime}>{comment.timestamp}</Text>
                    </View>
                    <Text style={styles.commentTextInList}>{comment.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorum yazın..."
                placeholderTextColor="#9ca3af"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <Pressable 
                style={[
                  styles.commentSendButton,
                  newComment.trim() ? styles.commentSendButtonActive : styles.commentSendButtonInactive
                ]}
                onPress={handleSendComment}
                disabled={!newComment.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newComment.trim() ? '#ffffff' : '#9ca3af'} 
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#00bcd4',
    shadowColor: '#00bcd4',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    resizeMode: 'contain',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  // Grid Sponsored Below Image Styles
  gridSponsoredBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  gridSponsoredByTextBelow: {
    color: '#dc2626',
    fontSize: 7,
    fontWeight: '500',
    marginRight: 2,
  },
  gridSponsorLogoBelow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 2,
  },
  gridSponsorTextBelow: {
    color: '#dc2626',
    fontSize: 7,
    fontWeight: '600',
    flex: 1,
  },
  // Comment Modal Styles
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  commentModalCloseButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsernameInList: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentTextInList: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendButtonActive: {
    backgroundColor: '#06b6d4',
  },
  commentSendButtonInactive: {
    backgroundColor: '#e5e7eb',
  },
});
