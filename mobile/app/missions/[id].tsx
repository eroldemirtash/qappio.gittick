import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { card3DStyles } from '@/src/theme/card3D';
import { supabase } from '@/src/lib/supabase';
import FeedCard from '@/src/features/missions/components/FeedCard';
import { fonts } from '@/src/utils/fonts';
import { getLevelColor } from '@/src/lib/levels';

const { width } = Dimensions.get('window');
const AVATAR_GAP = 6;

export default function MissionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = async () => {
    if (!id) {
      console.log('❌ No mission ID provided for posts');
      setPosts([]);
      return;
    }
    
    console.log('🔍 Fetching posts for mission ID:', id);
    
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('submissions')
        .select(`
          id,
          media_type,
          media_url,
          caption,
          like_count,
          comment_count,
          created_at,
          is_sponsored,
          sponsor_brand,
          user_id,
          mission_id,
          profiles!submissions_user_id_fkey (
            id,
            display_name,
            avatar_url,
            level_name,
            level_tier
          )
        `)
        .eq('mission_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('❌ Posts fetch error:', postsError);
        setPosts([]);
        return;
      }
      
      console.log('✅ REAL SUBMISSIONS DATA:', postsData);
      
      if (postsData && postsData.length > 0) {
        const mappedPosts = postsData.map((post: any) => ({
          id: post.id,
          media_type: post.media_type || 'image',
          media_url: post.media_url || 'https://via.placeholder.com/400',
          caption: post.caption || '',
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          created_at: post.created_at,
          is_sponsored: post.is_sponsored || false,
          sponsor_brand: post.sponsor_brand || null,
          user: {
            id: post.profiles?.id || 'unknown',
            display_name: post.profiles?.display_name || 'Kullanıcı',
            avatar_url: post.profiles?.avatar_url || 'https://via.placeholder.com/50',
            level_name: post.profiles?.level_name || 'Snapper',
            level_tier: post.profiles?.level_tier || 1
          },
          mission: {
            id: post.mission_id,
            title: mission?.title || 'Görev',
            brand: mission?.brand ? {
              id: mission.brand.id,
              name: mission.brand.name,
              logo_url: mission.brand.logoUrl
            } : null
          },
          comments: [] // TODO: Fetch comments if needed
        }));
        
        setPosts(mappedPosts);
        
        // Calculate total likes and posts
        const totalLikesCount = mappedPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
        const totalPostsCount = mappedPosts.length;
        setTotalLikes(totalLikesCount);
        setTotalPosts(totalPostsCount);
        
        // Calculate top users ranking
        const userStats = new Map();
        mappedPosts.forEach(post => {
          const userId = post.user.id;
          const userLikes = post.like_count || 0;
          
          if (userStats.has(userId)) {
            userStats.set(userId, {
              ...userStats.get(userId),
              likes: userStats.get(userId).likes + userLikes,
              posts: userStats.get(userId).posts + 1
            });
          } else {
            userStats.set(userId, {
              id: userId,
              name: post.user.display_name,
              avatar: post.user.avatar_url,
              level: post.user.level_name,
              likes: userLikes,
              posts: 1
            });
          }
        });
        
        // Sort by total likes and create ranking
        const sortedUsers = Array.from(userStats.values())
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 5)
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }));
        
        setTopUsers(sortedUsers);
        console.log('🎉 REAL POSTS LOADED SUCCESSFULLY!');
        console.log('📊 TOTAL LIKES:', totalLikesCount);
        console.log('📊 TOTAL POSTS:', totalPostsCount);
        console.log('🏆 TOP USERS:', sortedUsers);
      } else {
        console.log('⚠️ NO SUBMISSIONS FOUND FOR THIS MISSION');
        setPosts([]);
        setTopUsers([]);
        setTotalLikes(0);
        setTotalPosts(0);
      }
    } catch (err) {
      console.error('❌ Posts fetch error:', err);
      setPosts([]);
    }
  };

  const fetchMission = async () => {
    if (!id) {
      console.log('❌ No mission ID provided');
      return;
    }
    
    console.log('🔍 Fetching mission with ID:', id);
    
    try {
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select(`
          id,
          title,
          description,
          cover_url,
          qp_reward,
          starts_at,
          ends_at,
          brand_id,
          published
        `)
        .eq('id', id)
        .eq('published', true)
        .single();

      if (missionError) {
        console.error('❌ Mission fetch error:', missionError);
        return;
      }
      
      // Get brand data
      let brandData = null;
      if (missionData.brand_id) {
        const { data: brand, error: brandError } = await supabase
          .from('brands')
          .select(`
            id,
            name,
            logo_url
          `)
          .eq('id', missionData.brand_id)
          .single();

        if (!brandError) {
          brandData = brand;
          console.log('✅ Brand data fetched:', brandData);
        } else {
          console.error('❌ Brand fetch error:', brandError);
        }
      }

      // Calculate time left
      const now = new Date();
      const endTime = missionData.ends_at ? new Date(missionData.ends_at) : null;
      const timeLeft = endTime ? Math.max(0, endTime.getTime() - now.getTime()) : null;
      
      let timeLeftText = '';
      if (timeLeft !== null) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          timeLeftText = `${days}g ${hours}s ${minutes}dk`;
        } else if (hours > 0) {
          timeLeftText = `${hours}s ${minutes}dk`;
        } else {
          timeLeftText = `${minutes}dk`;
        }
      }

      const mappedMission = {
        id: missionData.id,
        title: missionData.title,
        description: missionData.description,
        coverUrl: missionData.cover_url,
        qpValue: missionData.qp_reward,
        timeLeft: timeLeftText,
        brand: brandData ? {
          id: brandData.id,
          name: brandData.name,
          logoUrl: brandData.logo_url,
          coverUrl: null
        } : null,
        totalLikes: totalLikes,
        totalPosts: totalPosts,
      };
      
      console.log('🎯 Mapped mission:', mappedMission);
      console.log('🎯 Brand info:', mappedMission.brand);
      setMission(mappedMission);
    } catch (err) {
      console.error('❌ Mission fetch error:', err);
      setMission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMission();
      // Posts will be fetched after mission is loaded
    };
    
    loadData();
  }, [id]);

  // Fetch posts after mission is loaded
  useEffect(() => {
    if (mission) {
      fetchPosts();
    }
  }, [mission]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#000';
    }
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Görev bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

             {/* Ranking Section */}
             <View style={styles.rankingSection}>
               <View style={styles.rankingContainer}>
                 {/* Brand Logo - Fixed */}
                 <View style={styles.brandLogoFixed}>
                   <Pressable 
                     style={styles.brandLogoContainer}
                     onPress={() => {
                       if (mission.brand?.id) {
                         router.push(`/brands/${mission.brand.id}`);
                       }
                     }}
                   >
                     <Image 
                       source={{ 
                         uri: mission.brand?.logoUrl || 'https://via.placeholder.com/50x50/06b6d4/ffffff?text=' + encodeURIComponent(mission.brand?.name || 'M')
                       }} 
                       style={styles.brandLogoRanking}
                     />
                   </Pressable>
                 </View>
                 
                 {/* Scrollable Users */}
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rankingScroll}>
                   {/* Top Users */}
                   {topUsers.length > 0 ? (
                     topUsers.map((user, index) => (
                       <View key={user.id} style={styles.rankingItem}>
                         <View style={styles.rankingAvatarContainer}>
                           <Image source={{ uri: user.avatar }} style={styles.rankingAvatar} />
                           <View style={[styles.rankBadge, { backgroundColor: getRankColor(user.rank) }]}>
                             <Text style={styles.rankText}>{user.rank}</Text>
                           </View>
                         </View>
                         <View style={styles.rankingStats}>
                           <View style={styles.rankingStat}>
                             <Ionicons name="heart" size={12} color="#ef4444" />
                             <Text style={styles.rankingStatText}>{user.likes}</Text>
                           </View>
                         </View>
                       </View>
                     ))
                   ) : (
                     <View style={styles.emptyRankingContainer}>
                       <Text style={styles.emptyRankingText}>Henüz sıralama yok</Text>
                     </View>
                   )}
                 </ScrollView>
               </View>
             </View>

        {/* Mission Detail Card - MissionCard Style */}
        <Pressable 
          style={[styles.missionCard, card3DStyles.card3D]}
          onPress={() => setModalVisible(true)}
        >
          <Image 
            source={{ uri: mission.coverUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' }} 
            style={styles.missionImage}
          />
          <View style={styles.missionOverlay} />
          
          {/* Brand Logo and Name - Top Left */}
          <Pressable 
            style={styles.brandInfo}
            onPress={() => {
              if (mission.brand?.id) {
                router.push(`/brands/${mission.brand.id}`);
              }
            }}
          >
            <Image 
              source={{ 
                uri: mission.brand?.logoUrl || 'https://via.placeholder.com/30x30/06b6d4/ffffff?text=' + encodeURIComponent(mission.brand?.name || 'M')
              }} 
              style={styles.brandLogo}
            />
            <Text style={styles.brandName}>{mission.brand?.name || 'Marka'}</Text>
          </Pressable>

          {/* Countdown and QP - Top Right */}
          <View style={styles.topRightContainer}>
            <View style={styles.countdownContainer}>
              <Ionicons name="hourglass-outline" size={12} color="#fff" style={styles.countdownIcon} />
              <Text style={styles.countdownText}>{mission.timeLeft || 'Süresiz'}</Text>
            </View>
            <View style={styles.qpContainer}>
              <LinearGradient
                colors={['#ffd700', '#ffb347', '#ff8c00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qpGradient}
              >
                <Text style={styles.qpText}>{mission.qpValue} QP</Text>
              </LinearGradient>
            </View>
          </View>


          {/* Mission Description - Center */}
          <View style={styles.missionDescriptionContainer}>
            <Text style={styles.missionDescription} numberOfLines={2}>
              {mission.description || 'Görev açıklaması buraya yazılacak...'}
            </Text>
            {mission.description && mission.description.length > 100 && (
              <Text style={styles.readMoreText}>devamı...</Text>
            )}
          </View>

               {/* Action Buttons and Qappishle Button - Bottom */}
               <View style={styles.actionButtons}>
                 {/* Post Count */}
                 <View style={styles.statItem}>
                   <LinearGradient
                     colors={['#06b6d4', '#0ea5e9', '#0284c7']}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={styles.statGradient}
                   >
                     <Ionicons name="images" size={20} color="#fff" />
                     <Text style={styles.statText}>{mission.totalPosts || 0}</Text>
                   </LinearGradient>
                 </View>
                 
                 <Pressable 
                   style={styles.qappishleButtonCompact} 
                   onPress={() => router.push(`/submit/${id}`)}
                 >
                   <LinearGradient
                     colors={['#06b6d4', '#0ea5e9', '#0284c7']}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={styles.qappishleGradientCompact}
                   >
                     <View style={styles.cameraIconContainer}>
                       <Ionicons name="camera-outline" size={36} color="#ffffff" />
                     </View>
                   </LinearGradient>
                 </Pressable>
                 
                 {/* Like Count */}
                 <View style={styles.statItem}>
                   <LinearGradient
                     colors={['#06b6d4', '#0ea5e9', '#0284c7']}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={styles.statGradient}
                   >
                     <Ionicons name="heart" size={20} color="#fff" />
                     <Text style={styles.statText}>{mission.totalLikes || 0}</Text>
                   </LinearGradient>
                 </View>
               </View>
        </Pressable>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <FeedCard 
                key={post.id} 
                post={post}
                onLike={(postId) => console.log('Like post:', postId)}
                onComment={(postId, text) => console.log('Comment on post:', postId, text)}
                onShare={(postId) => console.log('Share post:', postId)}
              />
            ))
          ) : (
            <View style={styles.emptyPostsContainer}>
              <Text style={styles.emptyPostsText}>Henüz paylaşım yok</Text>
              <Text style={styles.emptyPostsSubtext}>İlk paylaşımı sen yap!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mission Detail Modal */}
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
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1e293b" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalDescription}>{mission.description}</Text>
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  rankingSection: {
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoFixed: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
  },
  rankingScroll: {
    paddingLeft: 80,
    paddingRight: 16,
    paddingVertical: 4,
  },
  brandLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoRanking: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  rankingItem: {
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
    minHeight: 75,
  },
  rankingAvatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  rankBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  rankText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rankingStats: {
    alignItems: 'center',
  },
  rankingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rankingStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  missionCard: {
    ...card3DStyles.card3DMission,
    width: width - 32,
    height: 240,
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  missionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  missionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  brandInfo: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    resizeMode: 'contain',
  },
  brandName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topRightContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownIcon: {
    marginRight: 4,
  },
  countdownText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qpContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  qpGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qpText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  missionDescriptionContainer: {
    position: 'absolute',
    top: '45%',
    left: 12,
    right: 12,
    transform: [{ translateY: -10 }],
    alignItems: 'center',
  },
  missionDescription: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 18,
  },
  readMoreText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qappishleButtonCompact: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  qappishleGradientCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cameraIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  postsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  emptyPostsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyRankingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  emptyRankingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
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
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    padding: 20,
  },
});