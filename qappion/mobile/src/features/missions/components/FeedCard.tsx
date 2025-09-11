import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { card3DStyles } from '@/src/theme/card3D';

interface FeedCardProps {
  post: any;
  onMoreOptions: (post: any) => void;
}

export default function FeedCard({ post, onMoreOptions }: FeedCardProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleMoreOptions = () => {
    onMoreOptions(post);
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'Snapper': '#fbbf24',
      'Seeker': '#10b981', 
      'Crafter': '#8b5cf6',
      'Viralist': '#ef4444',
      'Qappian': '#1e40af'
    };
    return colors[level] || '#10b981';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { borderColor: getLevelColor('Seeker') }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>@kullanici_adi</Text>
            <View style={[styles.levelCard, { backgroundColor: getLevelColor('Seeker') }]}>
              <Text style={styles.levelText}>Seeker</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={handleMoreOptions} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* Media with badges */}
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&crop=center' }}
          style={styles.media}
        />
        
        {/* Sponsored by badge - top right */}
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored by</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center' }}
            style={styles.sponsorLogo}
          />
          <Text style={styles.sponsorName}>TechBrand</Text>
        </View>

        {/* Mission brand badge - top left */}
        <View style={styles.missionBrandBadge}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center' }}
            style={styles.brandLogo}
          />
          <Text style={styles.brandName}>TechBrand</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={handleLike} style={styles.actionButton}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#ef4444" : "#64748b"} 
            />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#64748b" />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.likesText}>
          {liked ? '1 beğeni' : 'Beğen'}
        </Text>
        <Text style={styles.caption}>
          <Text style={styles.username}>@kullanici_adi</Text> Bu görev harika! #qappio #mission
        </Text>
        <Text style={styles.commentsText}>Tüm yorumları gör (3)</Text>
        <Text style={styles.timeText}>2 saat önce</Text>
      </View>

      {/* Mission ticket */}
      <View style={styles.missionTicket}>
        <Ionicons name="star-outline" size={16} color="#1e293b" />
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center' }}
          style={styles.ticketBrandLogo}
        />
        <Text style={styles.ticketText}>TechBrand: Kablosuz Kulaklık Görevi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card3DStyles.card3DMission,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelCard: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
  },
  mediaContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sponsoredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  sponsorLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  sponsorName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  missionBrandBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  brandLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  brandName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  likesText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  caption: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentsText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  missionTicket: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ticketBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  ticketText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});