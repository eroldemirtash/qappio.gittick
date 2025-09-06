import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, RefreshControl, Pressable, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';
import FeedCard from '@/src/features/missions/components/FeedCard';

type Mission = {
  id: string;
  title: string;
  description: string | null;
  short_description?: string | null;
  cover_url: string | null;
  brand_name: string | null;
  brand_logo: string | null;
  qp_reward: number | null;
  starts_at: string | null;
  ends_at: string | null;
  total_posts: number;
  total_likes: number;
  is_sponsored?: boolean;
  sponsor_brand_name?: string | null;
  sponsor_brand_logo?: string | null;
  sponsor_brand?: {
    id: string;
    name: string;
    logo_url: string;
  };
};

type RankUser = {
  id: string;
  name: string;
  avatar: string;
  likes: number;
  rank: number;
  level: 'Snapper' | 'Seeker' | 'Crafter' | 'Viralist' | 'Qappian' | 'bronze' | 'silver' | 'gold' | string;
};

type FeedPost = {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  caption: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  is_sponsored: boolean;
  is_liked?: boolean;
  sponsor_brand?: {
    id: string;
    name: string;
    logo_url: string;
  } | null;
  user: {
    id: string;
    display_name: string;
    avatar_url: string;
    level_name: string;
    level_tier: number;
  };
  mission: {
    id: string;
    title: string;
    brand: {
      id: string;
      name: string;
      logo_url: string;
    };
  };
  latest_comment: {
    username: string;
    text: string;
  };
};

function formatTimeLeft(startsAt?: string | null, endsAt?: string | null) {
  try {
    const now = new Date();
    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;
    if (start && now < start) return 'Yakında';
    if (!end) return '';
    if (now >= end) return 'Sona erdi';
    const diffMs = end.getTime() - now.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMin / (60 * 24));
    const hours = Math.floor((diffMin % (60 * 24)) / 60);
    const mins = diffMin % 60;
    if (days > 0) return `${days}g ${hours}s ${mins}dk`;
    if (hours > 0) return `${hours}s ${mins}dk`;
    return `${mins}dk`;
  } catch {
    return '';
  }
}

function levelColor(level: RankUser['level']) {
  switch (level) {
    case 'Snapper': return '#fbbf24'; // Yellow
    case 'Seeker': return '#10b981'; // Green
    case 'Crafter': return '#8b5cf6'; // Purple
    case 'Viralist': return '#f59e0b'; // Orange
    case 'Qappian': return '#06b6d4'; // Cyan
    case 'gold': return '#ffd700';
    case 'silver': return '#c0c0c0';
    case 'bronze': return '#cd7f32';
    default: return '#6b7280'; // Default gray
  }
}

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [netErr, setNetErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [topUsers, setTopUsers] = useState<RankUser[]>([]);
  const [rankLoading, setRankLoading] = useState(true);
  
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappio', headerTitleAlign: 'center' });
  }, [navigation]);

  const fetchMission = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setMission(null);
      setLoading(false);
      setNetErr('Geçersiz görev kimliği');
      return;
    }
    setLoading(true);
    setNetErr(null);
    try {
      const { data, error } = await supabase
        .from('v_missions_public')
        .select('id,title,short_description,cover_url,brand_name,brand_logo,qp_reward,starts_at,ends_at,is_sponsored,sponsor_brand_name,sponsor_brand_logo')
        .eq('id', id as string)
        .maybeSingle(); // ✅ single -> maybeSingle

      if (error) {
        console.error('❌ Mission fetch error:', error);
        setNetErr(error.message ?? 'Bilinmeyen hata');
        setMission(null);
      } else {
        // Mock data for total_posts and total_likes (gerçek veriler için ayrı sorgu gerekir)
        const missionData = data ? {
          ...data,
          description: data.short_description || 'Görev açıklaması bulunamadı',
          total_posts: Math.floor(Math.random() * 100) + 10, // Mock: 10-110 arası
          total_likes: Math.floor(Math.random() * 500) + 50, // Mock: 50-550 arası
          // Sponsor bilgilerini ekle
          sponsor_brand: data.is_sponsored && data.sponsor_brand_name ? {
            id: 'sponsor-' + data.id,
            name: data.sponsor_brand_name,
            logo_url: data.sponsor_brand_logo || 'https://via.placeholder.com/48'
          } : undefined
        } : null;
        setMission(missionData);
      }
    } catch (e: any) {
      console.error('❌ Mission fetch exception:', e);
      setNetErr(String(e?.message ?? e));
      setMission(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFeedPosts = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setFeedLoading(false);
      return;
    }

    try {
      // Mock data for now - later we'll fetch from submissions table
      const mockPosts: FeedPost[] = [
        {
          id: 'post-1',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop',
          caption: 'Qappio geliyor görevini tamamladım! Harika bir deneyimdi 🚀',
          like_count: 24,
          comment_count: 8,
          created_at: new Date().toISOString(),
          is_sponsored: false,
          sponsor_brand: null,
          user: {
            id: 'user-1',
            display_name: 'Ahmet Yılmaz',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            level_name: 'Snapper',
            level_tier: 1
          },
          mission: {
            id: id as string,
            title: 'Qappio geliyor',
            brand: {
              id: 'brand-1',
              name: 'Qappio Team',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Ayşe',
            text: 'Çok güzel olmuş!'
          }
        },
        {
          id: 'post-2',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&fit=crop',
          caption: 'iPhone 15 Pro ile çektim, mükemmel kalite! 📱',
          like_count: 18,
          comment_count: 5,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_sponsored: false,
          sponsor_brand: null,
          user: {
            id: 'user-2',
            display_name: 'Mehmet Kaya',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            level_name: 'Seeker',
            level_tier: 2
          },
          mission: {
            id: id as string,
            title: 'Qappio geliyor',
            brand: {
              id: 'brand-1',
              name: 'Qappio Team',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Fatma',
            text: 'Hangi kamera kullandın?'
          }
        },
        {
          id: 'post-3',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop',
          caption: 'Nike Air Max ile koşu yaparken çektim! 🏃‍♂️',
          like_count: 32,
          comment_count: 12,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_sponsored: false,
          sponsor_brand: null,
          user: {
            id: 'user-3',
            display_name: 'Zeynep Demir',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            level_name: 'Crafter',
            level_tier: 3
          },
          mission: {
            id: id as string,
            title: 'Qappio geliyor',
            brand: {
              id: 'brand-1',
              name: 'Qappio Team',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Ali',
            text: 'Süper enerji!'
          }
        }
      ];

      setFeedPosts(mockPosts);
    } catch (err: any) {
      console.error('Feed posts fetch error:', err);
    } finally {
      setFeedLoading(false);
    }
  }, [id]);

  const fallbackTopUsers: RankUser[] = [
    { id: '1', name: 'user1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', likes: 245, rank: 1, level: 'gold' },
    { id: '2', name: 'user2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', likes: 198, rank: 2, level: 'silver' },
    { id: '3', name: 'user3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', likes: 156, rank: 3, level: 'bronze' },
    { id: '4', name: 'user4', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', likes: 134, rank: 4, level: 'Snapper' },
    { id: '5', name: 'user5', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', likes: 98, rank: 5, level: 'Seeker' },
  ];

  const fetchRanking = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setTopUsers([]);
      setRankLoading(false);
      return;
    }
    setRankLoading(true);
    try {
      // Fallback: Mock data (leaderboard view yok)
      setTopUsers(fallbackTopUsers);
    } catch (e) {
      console.warn('⚠️ Ranking fetch fallback:', e);
      setTopUsers(fallbackTopUsers);
    } finally {
      setRankLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMission();
    fetchRanking();
    fetchFeedPosts();
  }, [fetchMission, fetchRanking, fetchFeedPosts]);

  // Realtime updates for mission stats
  useEffect(() => {
    if (!mission?.id) return;

    const channel = supabase
      .channel(`mission-${mission.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'mission_submissions' },
        () => {
          // Refresh mission data when submissions change
          fetchMission();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mission_likes' },
        () => {
          // Refresh mission data when likes change
          fetchMission();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mission?.id, fetchMission]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMission(), fetchRanking(), fetchFeedPosts()]);
    setRefreshing(false);
  };

  // Feed post handlers
  const handleLike = (postId: string) => {
    setFeedPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.is_liked || false;
          const newLikeCount = wasLiked 
            ? (post.like_count || 0) - 1  // Beğeniyi geri al
            : (post.like_count || 0) + 1; // Beğeni ekle
          
          return {
            ...post,
            like_count: Math.max(0, newLikeCount), // Negatif olmasın
            is_liked: !wasLiked
          };
        }
        return post;
      })
    );
    console.log('Toggled like for post:', postId);
  };

  const handleComment = (postId: string, text: string) => {
    setFeedPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comment_count: (post.comment_count || 0) + 1 }
          : post
      )
    );
    console.log('Commented on post:', postId, 'Text:', text);
  };

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId);
  };

  // ---- UI STATES ----
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text style={styles.dimText}>Yükleniyor…</Text>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={32} color="#ef4444" />
        <Text style={[styles.dimText, { marginTop: 8 }]}>
          Görev bulunamadı veya kaldırılmış olabilir.
        </Text>
        {netErr ? <Text style={[styles.dimText, { marginTop: 4 }]}>{netErr}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
            <Text style={styles.ghostBtnText}>Geri dön</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={fetchMission}>
            <Text style={styles.primaryBtnText}>Yenile</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- SUCCESS ----
  const cover = mission.cover_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop';
  const brandLogo = mission.brand_logo || 'https://via.placeholder.com/48';
  const timeLeft = formatTimeLeft(mission.starts_at, mission.ends_at);
  const qp = mission.qp_reward ?? 0;
  const description = mission.description || mission.short_description || 'Açıklama bulunamadı';
  const isDescriptionLong = description.length > 150;

  const goQappishle = () => router.push(`/submit/${mission.id}`); // ✅ foto çek/yükle akışı
  const toggleDescriptionModal = () => setShowDescriptionModal(!showDescriptionModal);

  const RankingStrip = () => (
    <View style={styles.rankingSection}>
      {/* Sticky Brand Logo */}
      <View style={styles.stickyBrandLogo}>
        <Image source={{ uri: brandLogo }} style={styles.stickyBrandImage} />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.rankingScrollView}
        contentContainerStyle={styles.rankingScrollContent}
      >
        {topUsers.map((u) => (
          <View key={u.id} style={styles.rankingItem}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarBorder, { borderColor: levelColor(u.level) }]}>
                <Image source={{ uri: u.avatar }} style={styles.rankingAvatar} />
              </View>
              <View style={[styles.rankBadge, { backgroundColor: u.rank === 1 ? '#ffd700' : u.rank === 2 ? '#c0c0c0' : u.rank === 3 ? '#cd7f32' : '#0f172a' }]}>
                <Text style={styles.rankText}>{u.rank}</Text>
              </View>
            </View>
            <View style={styles.likesRow}>
              <Ionicons name="heart" size={12} color="#ef4444" />
              <Text style={styles.likesText}>{u.likes}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 8, paddingTop: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00bcd4']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Ranking satırı */}
      {!rankLoading && topUsers.length > 0 ? <RankingStrip /> : null}

      {/* Mission Card */}
      <View style={styles.card}>
        <Image source={{ uri: cover }} style={styles.image} />
        <View style={styles.overlay} />

        {/* Brand - TL */}
        <View style={styles.brandChip}>
          <Image source={{ uri: brandLogo }} style={styles.brandLogo} />
          <Text style={styles.brandName}>{mission.brand_name ?? 'Bilinmeyen Marka'}</Text>
        </View>

        {/* Sponsored By - Below Brand */}
        {mission.is_sponsored && mission.sponsor_brand_name && (
          <View style={styles.sponsoredBelowBrand}>
            <View style={styles.sponsoredBelowBrandChip}>
              <Text style={styles.sponsoredBelowBrandText}>Sponsored by</Text>
              <Image 
                source={{ uri: mission.sponsor_brand_logo || 'https://via.placeholder.com/30' }} 
                style={styles.sponsoredBelowBrandLogo} 
              />
              <Text style={styles.sponsoredBelowBrandSponsorText}>{mission.sponsor_brand_name}</Text>
            </View>
          </View>
        )}



        {/* Time & QP - TR */}
        <View style={styles.topRight}>
          {!!timeLeft && (
            <View style={styles.timePill}>
              <Text style={styles.timeText}>{timeLeft}</Text>
            </View>
          )}
          <View style={styles.qpWrap}>
            <LinearGradient colors={['#ffd700', '#ffb347', '#ff8c00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.qpGrad}>
              <Text style={styles.qpText}>{qp} QP</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Description - Center */}
        <View style={styles.titleWrap}>
          <Text 
            style={styles.title} 
            numberOfLines={3}
            onPress={isDescriptionLong ? toggleDescriptionModal : undefined}
          >
            {description}
          </Text>
          {isDescriptionLong && (
            <Pressable onPress={toggleDescriptionModal} style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>Devamı...</Text>
            </Pressable>
          )}
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomRow}>
          <View style={styles.statsBtn}>
            <Ionicons name="camera-outline" size={16} color="#fff" />
            <Text style={styles.statsText}>{feedPosts.length}</Text>
          </View>
          <Pressable style={styles.ctaBtn} onPress={goQappishle}>
            <LinearGradient colors={['#00bcd4', '#0097a7', '#006064']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGrad}>
              <Ionicons name="camera" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.ctaText}>Qappishle!</Text>
            </LinearGradient>
          </Pressable>
          <View style={styles.statsBtn}>
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text style={styles.statsText}>{feedPosts.reduce((total, post) => total + (post.like_count || 0), 0)}</Text>
          </View>
        </View>
      </View>

      {/* Feed Posts Section */}
      {feedPosts.length > 0 && (
        <View style={styles.feedSection}>
          {feedLoading ? (
            <View style={styles.feedLoading}>
              <ActivityIndicator size="small" color="#00bcd4" />
              <Text style={styles.feedLoadingText}>Paylaşımlar yükleniyor...</Text>
            </View>
          ) : (
            <View style={styles.feedList}>
              {feedPosts.map((item) => (
                <FeedCard
                  key={item.id}
                  post={item}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Description Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleDescriptionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Görev Açıklaması</Text>
              <Pressable onPress={toggleDescriptionModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>{description}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  dimText: { color: '#64748b', fontSize: 14, textAlign: 'center' },

  // Ranking
  rankingSection: { 
    marginBottom: 12, 
    paddingVertical: 12, 
    backgroundColor: '#f8fafc', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    flexDirection: 'row', 
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  stickyBrandLogo: { 
    position: 'absolute', 
    left: 8, 
    top: 8, 
    zIndex: 100, 
    backgroundColor: '#fff', 
    borderRadius: 27, 
    padding: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 6, 
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  stickyBrandImage: { width: 54, height: 54, borderRadius: 27 },
  rankingScrollView: { flex: 1, marginLeft: 80 },
  rankingScrollContent: { paddingRight: 8 },
  rankingItem: { 
    alignItems: 'center', 
    marginRight: 8, 
    width: 70 
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 2
  },
  avatarBorder: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    borderWidth: 3, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  rankingAvatar: { 
    width: 54, 
    height: 54, 
    borderRadius: 27 
  },
  rankBadge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  rankText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#fff' 
  },
  likesRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3, 
    marginTop: 0 
  },
  likesText: { 
    color: '#64748b', 
    fontSize: 11, 
    fontWeight: '600' 
  },

  // Mission card
  card: { borderRadius: 16, overflow: 'hidden', height: 210, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' },

  brandChip: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  brandLogo: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  brandName: { color: '#fff', fontWeight: '600', fontSize: 13 },

  // Sponsored styles
  sponsoredChip: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sponsoredByText: { color: '#fff', fontWeight: '500', fontSize: 10, marginRight: 4 },
  sponsorLogo: { width: 16, height: 16, borderRadius: 8, marginRight: 4 },
  sponsorText: { color: '#fff', fontWeight: '600', fontSize: 11 },

  // Sponsored By Section (below ranking)
  sponsoredBySection: { marginTop: 12, marginBottom: 8 },
  sponsoredBySectionChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ef4444', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sponsoredBySectionText: { 
    fontSize: 10, 
    color: '#ffffff', 
    fontWeight: '600', 
    marginRight: 3, 
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2, 
  },
  sponsoredBySectionLogo: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 4, 
  },
  sponsoredBySectionSponsorText: { 
    fontSize: 10, 
    color: '#ffffff', 
    fontWeight: '600', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2, 
  },


  topRight: { position: 'absolute', top: 16, right: 16, alignItems: 'flex-end' },
  timePill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  timeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  qpWrap: { borderRadius: 12, overflow: 'hidden', elevation: 4 },
  qpGrad: { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  qpText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  titleWrap: { position: 'absolute', top: '50%', left: 16, right: 16, transform: [{ translateY: -12 }] },
  title: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, lineHeight: 20 },
  readMoreBtn: { marginTop: 8, alignSelf: 'center' },
  readMoreText: { color: '#00bcd4', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },

  bottomRow: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
  statsText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  ctaBtn: { 
    minWidth: 120, 
    borderRadius: 12, 
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  ctaGrad: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  ctaText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  closeBtn: { padding: 4 },
  modalBody: { padding: 20 },
  modalDescription: { fontSize: 16, lineHeight: 24, color: '#1e293b' },

  // Sponsored Below Brand (in mission card)
  sponsoredBelowBrand: { 
    position: 'absolute', 
    top: 50, // Below brand chip
    left: 16, 
  },
  sponsoredBelowBrandChip: { 
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
  sponsoredBelowBrandText: { 
    fontSize: 10, 
    color: '#ffffff', 
    fontWeight: '600', 
    marginRight: 3, 
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2, 
  },
  sponsoredBelowBrandLogo: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 4, 
  },
  sponsoredBelowBrandSponsorText: { 
    fontSize: 10, 
    color: '#ffffff', 
    fontWeight: '600', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2, 
  },

  // Feed Section styles
  feedSection: {
    marginTop: 24,
  },
  feedList: {
    gap: 0, // FeedCard'lar arasında boşluk yok, tam ana akış gibi
  },
  feedLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  feedLoadingText: {
    fontSize: 14,
    color: '#64748b',
  },

  // Button styles
  ghostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  ghostBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});