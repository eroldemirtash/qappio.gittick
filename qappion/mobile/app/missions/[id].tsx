import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { card3DStyles } from '@/src/theme/card3D';
import { supabase } from '@/src/lib/supabase';

const { width } = Dimensions.get('window');
const AVATAR_GAP = 6; // avatarlar arası boşluk (öncekine göre %50 dar)

export default function MissionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState([
    { id: '1', name: 'user1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', likes: 245, rank: 1, level: 'gold' },
    { id: '2', name: 'user2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', likes: 198, rank: 2, level: 'silver' },
    { id: '3', name: 'user3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', likes: 156, rank: 3, level: 'bronze' },
    { id: '4', name: 'user4', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', likes: 134, rank: 4, level: 'bronze' },
    { id: '5', name: 'user5', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', likes: 98, rank: 5, level: 'bronze' },
  ]);

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) return;
      
    try {
      // First get mission data
      const { data: missionData, error: missionError } = await supabase
          .from('missions')
          .select('*')
        .eq('id', id)
        .single();

        if (missionError) {
          console.error('❌ Mission fetch error:', missionError);
          return;
        }
        
        console.log('✅ Mission data:', missionData);
        
        // Then get brand data
        let brandData = null;
        if (missionData.brand_id) {
          const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select(`
              *,
              brand_profiles(*)
            `)
            .eq('id', missionData.brand_id)
            .single();
          
          if (!brandError) {
            brandData = brand;
          }
        }
        
        // Map mission data to expected format
        const mappedMission = {
          id: missionData.id,
          title: missionData.title,
          brand: brandData?.name || '',
          brandLogo: brandData?.brand_profiles?.logo_url || 'https://via.placeholder.com/50',
          image: missionData.cover_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
          qpValue: missionData.qp_reward ?? 0,
          timeLeft: '2g 15s 30dk', // Mock for now
          description: missionData.short_description || missionData.description || '',
          fullDescription: missionData.short_description || missionData.description || '',
          totalLikes: 1250, // Mock for now
          totalPosts: 89, // Mock for now
          isSponsored: missionData.is_sponsored || false,
          sponsorBrand: missionData.sponsor_brand_name || '',
          sponsorBrandLogo: missionData.sponsor_brand_logo || '',
        };
        
        setMission(mappedMission);
      } catch (err) {
        console.error('❌ Mission fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

    fetchMission();
  }, [id]);

  // Realtime subscription for likes (temporarily disabled until Supabase is configured)
  // useEffect(() => {
  //   const subscription = supabase
  //     .channel('mission-likes')
  //     .on('postgres_changes', 
  //       { 
  //         event: '*', 
  //         schema: 'public', 
  //         table: 'submissions',
  //         filter: `mission_id=eq.${id}`
  //       }, 
  //       (payload: any) => {
  //         // Update likes count in real-time
  //         setTopUsers(prevUsers => 
  //           prevUsers.map(user => {
  //             if (user.id === payload.new?.user_id) {
  //               return { ...user, likes: payload.new?.likes_count || user.likes };
  //             }
  //             return user;
  //           })
  //         );
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Görev bulunamadı</Text>
      </View>
    );
  }



  const posts = [
    {
      id: '1',
      userId: '1',
      user: 'kullanici1',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
      likes: 245,
      comments: 12,
    },
    {
      id: '2',
      userId: '2',
      user: 'kullanici2',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center',
      likes: 198,
      comments: 8,
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#c0c0c0'; // Silver
      case 3: return '#cd7f32'; // Bronze
      default: return '#000'; // Black
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Snapper': return '#fbbf24'; // Sarı
      case 'Seeker': return '#10b981'; // Yeşil
      case 'Crafter': return '#8b5cf6'; // Mor
      case 'Viralist': return '#ef4444'; // Kırmızı
      case 'Qappian': return '#1e40af'; // Lacivert
      default: return '#64748b'; // Gri
    }
  };

  const UserRankingItem = ({ user }: { user: any }) => (
    <View style={styles.rankingItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarBorder, { borderColor: getLevelColor(user.level) }]}>
          <Image source={{ uri: user.avatar }} style={styles.rankingAvatar} />
        </View>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(user.rank) }]}>
          <Text style={[styles.rankText, { color: user.rank <= 3 ? '#fff' : '#fff' }]}>
            {user.rank}
          </Text>
        </View>
      </View>
      <View style={styles.rankingInfo}>
        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={12} color="#ef4444" />
          <Text style={styles.rankingLikes}>{user.likes}</Text>
        </View>
      </View>
      </View>
    );

  const PostCard = ({ post }: { post: any }) => {
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
      setLiked(!liked);
      // Gerçek zamanlı beğeni güncellemesi
      setTopUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === post.userId) {
            return { ...user, likes: liked ? user.likes - 1 : user.likes + 1 };
          }
          return user;
        })
      );
      
      // Mission stats'ı da güncelle
      if (post.userId === '1') {
        mission.totalLikes = liked ? mission.totalLikes - 1 : mission.totalLikes + 1;
      }
    };

  return (
      <View style={styles.feedCard}>
        {/* Header */}
        <View style={styles.feedHeader}>
          <View style={styles.feedUserInfo}>
            <View style={[styles.feedAvatarContainer, { borderColor: getLevelColor('Seeker') }]}>
              <Image source={{ uri: post.avatar }} style={styles.feedAvatar} />
            </View>
            <View style={styles.feedUserDetails}>
              <Text style={styles.feedUsername}>@{post.user}</Text>
              <View style={[styles.feedLevelCard, { backgroundColor: getLevelColor('Seeker') }]}>
                <Text style={styles.feedLevelText}>Seeker</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.feedMoreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Media with badges */}
        <View style={styles.feedMediaContainer}>
          <Image source={{ uri: post.image }} style={styles.feedMedia} />
          
          {/* Mission brand badge - top left */}
          <View style={styles.feedMissionBrandBadge}>
            <Image source={{ uri: mission.brandLogo }} style={styles.feedBrandLogo} />
            <Text style={styles.feedBrandName}>{mission.brand}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.feedActions}>
          <View style={styles.feedLeftActions}>
            <Pressable onPress={handleLike} style={styles.feedActionButton}>
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={24} 
                color={liked ? "#ef4444" : "#64748b"} 
              />
            </Pressable>
            <Pressable style={styles.feedActionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#64748b" />
            </Pressable>
            <Pressable style={styles.feedActionButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#64748b" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.feedContent}>
          <Text style={styles.feedLikesText}>
            {liked ? `${post.likes + 1} beğeni` : `${post.likes} beğeni`}
          </Text>
          <Text style={styles.feedCaption}>
            <Text style={styles.feedUsername}>@{post.user}</Text> Kahve deneyimim harikaydı! #CoffeeBrand
          </Text>
          <Text style={styles.feedCommentsText}>Tüm yorumları gör ({post.comments})</Text>
          <Text style={styles.feedTimeText}>2 saat önce</Text>
        </View>

        {/* Mission ticket */}
        <View style={styles.feedMissionTicket}>
          <Ionicons name="star-outline" size={16} color="#1e293b" />
          <Image source={{ uri: mission.brandLogo }} style={styles.feedTicketBrandLogo} />
          <Text style={styles.feedTicketText}>{mission.brand}: {mission.title}</Text>
        </View>
            </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingTop: 0 }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
      >
        {/* Ranking Section */}
        <View style={styles.rankingSection}>
          <View style={styles.brandLogoSticky}>
            <Image source={{ uri: mission.brandLogo }} style={styles.stickyBrandLogo} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rankingScroll}
            contentContainerStyle={styles.rankingContent}
          >
            {topUsers.map((user) => (
              <UserRankingItem key={user.id} user={user} />
            ))}
          </ScrollView>
        </View>

        {/* Mission Detail Card */}
        <View style={styles.missionCard}>
          <Image source={{ uri: mission.image }} style={styles.missionImage} />
          <View style={styles.missionOverlay} />
          
          {/* Brand Info - Top Left */}
          <View style={styles.missionBrandInfo}>
            <Image source={{ uri: mission.brandLogo }} style={styles.missionBrandLogo} />
            <Text style={styles.missionBrandName}>{mission.brand}</Text>
              </View>

          {/* Sponsored Badge - Top Right */}
          {mission.isSponsored && mission.sponsorBrand && (
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Sponsored by</Text>
              <Image
                source={{ uri: mission.sponsorBrandLogo || 'https://via.placeholder.com/20' }}
                style={styles.sponsorLogo}
              />
              <Text style={styles.sponsorName}>{mission.sponsorBrand}</Text>
            </View>
          )}

          {/* Time and QP - Top Right */}
          <View style={styles.missionTopRight}>
            <View style={styles.missionTimeContainer}>
              <Text style={styles.missionTimeText}>{mission.timeLeft}</Text>
            </View>
            <View style={styles.missionQpContainer}>
              <LinearGradient
                colors={['#ffd700', '#ffb347', '#ff8c00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.missionQpGradient}
              >
                <Text style={styles.missionQpText}>{mission.qpValue} QP</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Stats - Bottom */}
          <View style={styles.missionStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color="#ef4444" />
              <Text style={styles.statTextSmall}>{mission.totalLikes}</Text>
            </View>
              </View>
          <View style={styles.missionStatsRight}>
            <View style={styles.statItem}>
              <Ionicons name="images" size={14} color="#3b82f6" />
              <Text style={styles.statTextSmall}>{mission.totalPosts}</Text>
            </View>
          </View>

                              {/* Qappishle Button */}
          <View style={styles.qappishleContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.qappishleButton, 
                card3DStyles.card3D,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => router.push(`/submit/${id}`)}
            >
              <LinearGradient
                colors={['#00bcd4', '#0097a7', '#006064']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qappishleGradient}
              >
                <Ionicons name="camera" size={20} color="#ffffff" style={styles.cameraIcon} />
                <Text style={styles.qappishleText}>Qappishle!!!</Text>
              </LinearGradient>
            </Pressable>
        </View>

          {/* Mission Description - Center */}
          <View style={styles.missionDescriptionContainer}>
            <Text style={styles.missionDescription} numberOfLines={2}>
              {mission.description}
            </Text>
            {mission.description.length > 100 && (
              <Pressable onPress={() => setModalVisible(true)}>
                <Text style={styles.readMoreText}>devamı...</Text>
              </Pressable>
            )}
          </View>

        </View>



        {/* Posts Section */}
        <View style={styles.postsSection}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>

      {/* Full Description Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Görev Detayı</Text>
        <Pressable
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1e293b" />
        </Pressable>
      </View>
            <Text style={styles.modalDescription}>{mission.fullDescription}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flex: 1,
  },
  rankingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 0,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brandLogoSticky: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  stickyBrandLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  rankingScroll: {
    flex: 1,
    paddingLeft: 8,
  },
  rankingContent: {
    paddingRight: 16,
    alignItems: 'center',
    gap: AVATAR_GAP,     // ✅ aralık burada yönetiliyor
  },
  rankingItem: {
    alignItems: 'center',
    width: 72,           // 96 → 72 (öğe genişliği daraldı)
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 1,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rankingAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  rankingInfo: {
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankingLikes: {
    color: '#000000',
    fontSize: 10,
  },
  missionCard: {
    ...card3DStyles.card3DMission,
    margin: 16,
    height: 300,
    position: 'relative',
    overflow: 'hidden',
  },
  missionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  missionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.32)', // "bir tık" daha şeffaf
  },
  missionBrandInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  missionBrandLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  missionBrandName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  missionTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  missionTimeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  missionTimeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  missionQpContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  missionQpGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionQpText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  missionStats: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  missionStatsRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statTextLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statTextSmall: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  missionDescriptionContainer: {
    position: 'absolute',
    top: '50%',
    left: 16,
    right: 16,
    transform: [{ translateY: -20 }],
  },
  missionDescription: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  readMoreText: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  qappishleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  qappishleButton: {
    width: '36%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  qappishleGradient: {
    flexDirection: 'column',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    marginBottom: 4,
  },
  qappishleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postsTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  feedCard: {
    ...card3DStyles.card3DMission,
    marginBottom: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  feedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feedAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  feedUserDetails: {
    flex: 1,
  },
  feedUsername: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedLevelCard: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  feedLevelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  feedMoreButton: {
    padding: 4,
  },
  feedMediaContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  feedMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  feedMissionBrandBadge: {
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
  feedBrandLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  feedBrandName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedActionButton: {
    marginRight: 16,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  feedLikesText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedCaption: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  feedCommentsText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  feedTimeText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  feedMissionTicket: {
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
  feedTicketBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  feedTicketText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  postAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserDetails: {
    flex: 1,
  },
  postLevelCard: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  postLevelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  postMoreButton: {
    padding: 4,
  },
  postMediaContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  postMissionBrandBadge: {
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
  },
  postBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  postBrandName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postLikesText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  postMissionTicket: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postTicketBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 6,
  },
  postTicketText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUsername: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionButton: {
    marginRight: 16,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postLikes: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '600',
  },
  postCaption: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  postComments: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  postTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  postBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postSharedLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  qappishleButtonInline: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  qappishleGradientInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cameraIconInline: {
    marginRight: 4,
  },
  qappishleTextInline: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomLikesLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSharedLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  // Sponsored Badge Styles
  sponsoredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
});