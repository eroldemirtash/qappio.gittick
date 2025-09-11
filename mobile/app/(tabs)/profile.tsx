import { View, Text, Pressable, Alert, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useEffect, useState, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/useAuth';
import { maybeRegisterPush } from '@/src/utils/push';
import { Ionicons } from '@expo/vector-icons';
import FeedCard from '@/src/features/missions/components/FeedCard';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ followers: number; following: number; posts: number }>({ followers: 0, following: 0, posts: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'posts' | 'missions' | 'products' | 'favorites'>('posts');
  const [items, setItems] = useState<any[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const levelColors = useMemo(() => {
    const name = (profile?.level_name || 'Snapper').toLowerCase();
    const map: Record<string, { border: string; grad: string[] }> = {
      snapper: { border: '#f59e0b', grad: ['#fbbf24', '#f59e0b'] },
      seeker: { border: '#059669', grad: ['#10b981', '#059669'] },
      crafter: { border: '#6d28d9', grad: ['#8b5cf6', '#6d28d9'] },
      viralist: { border: '#b91c1c', grad: ['#ef4444', '#b91c1c'] },
      qappian: { border: '#1e3a8a', grad: ['#1e40af', '#1e3a8a'] },
    };
    return map[name] || map.snapper;
  }, [profile?.level_name]);

  const username = useMemo(() => {
    const u = (profile as any)?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'kullanici';
    return u.startsWith('@') ? u : `@${u}`;
  }, [profile, user]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  useEffect(() => {
    // İlk veri yükleme
    fetchAll();
    // Realtime abonelikleri: etkin tab ile ilişkili tablolar
    setupRealtime();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await maybeRegisterPush();
      if (token) {
        setPushToken(token.data);
      }

      // Save token to profile
      if (user && token) {
        await supabase
          .from('profiles')
          .update({ push_token: token.data })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  const setupRealtime = () => {
    try {
      const ch = supabase
        .channel('profile_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'postcards' }, () => refetchActive())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_submissions' }, () => refetchActive())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_txns' }, () => refetchActive())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => refetchActive())
        .subscribe();
      channelRef.current = ch;
    } catch (e) {
      // sessizce geç
    }
  };

  const refetchActive = () => {
    if (!user) return;
    if (activeTab === 'posts') fetchPosts();
    else if (activeTab === 'missions') fetchMissions();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'favorites') fetchFavorites();
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStats(), fetchPosts()]);
    } catch (e) {
      setError('Profil verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Placeholder istatistikler; gerçek tablolarla değiştirilecek
      // Örn: followers, following tabloları
      setStats({ followers: 128, following: 76, posts: 12 });
    } catch {}
  };

  const mapMissionToCard = (mission: any) => ({
    id: mission.id,
    media_type: 'image',
    media_url: mission.cover_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop',
    caption: mission.title,
    like_count: Math.floor(Math.random() * 100) + 10,
    comment_count: Math.floor(Math.random() * 20) + 5,
    created_at: mission.created_at,
    is_sponsored: false,
    sponsor_brand: null,
    user: {
      id: user?.id || 'me',
      display_name: profile?.display_name || 'Ben',
      avatar_url: (profile as any)?.avatar_url,
      level_name: profile?.level_name || 'Snapper',
      level_tier: 1,
    },
    mission: {
      id: mission.id,
      title: mission.title,
      brand: {
        id: mission.brand_id || null,
        name: mission.brand_name || 'Qappio',
        logo_url: mission.brand_logo || 'https://via.placeholder.com/50',
      },
    },
    latest_comment: null,
    qp_reward: mission.qp_reward ?? 0,
    starts_at: mission.starts_at,
    ends_at: mission.ends_at,
  });

  const fetchPosts = async () => {
    try {
      // Kullanıcının gönderileri: akıştaki FeedCard yapısına uygun örnek veri
      const sample = Array.from({ length: 9 }).map((_, i) => ({
        id: `post-${i}`,
        media_type: 'image',
        media_url: `https://picsum.photos/seed/post${i}/800/800`,
        caption: 'Profil paylaşımı',
        like_count: Math.floor(Math.random() * 50) + 1,
        comment_count: Math.floor(Math.random() * 10),
        created_at: new Date().toISOString(),
        is_sponsored: false,
        sponsor_brand: null,
        user: {
          id: user?.id || `user-${i}`,
          display_name: profile?.display_name || 'Ben',
          avatar_url: (profile as any)?.avatar_url,
          level_name: profile?.level_name || 'Snapper',
          level_tier: 1,
        },
        mission: null,
        latest_comment: null,
      }));
      setItems(sample);
      setActiveTab('posts');
    } catch {}
  };

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('v_missions_public')
        .select('id,title,brand_name,brand_logo,brand_id,cover_url,created_at,starts_at,ends_at,qp_reward')
        .order('created_at', { ascending: false })
        .limit(18);
      if (error) throw error;
      if (data && data.length > 0) {
        setItems((data || []).map(mapMissionToCard));
      } else {
        // Fallback sample content to verify layout when there is no data
        const sample = Array.from({ length: 4 }).map((_, i) => mapMissionToCard({
          id: `m-${i}`,
          title: `Örnek Görev ${i + 1}`,
          brand_name: ['Marka A','Marka B','Marka C'][i % 3],
          brand_logo: 'https://via.placeholder.com/50',
          brand_id: `b-${i}`,
          cover_url: `https://picsum.photos/seed/mission${i}/900/600`,
          created_at: new Date().toISOString(),
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 1000 * 60 * (60 + i * 10)).toISOString(),
          qp_reward: Math.floor(Math.random()*200)+50,
        }));
        setItems(sample);
      }
      setActiveTab('missions');
    } catch {
      // On error also show sample
      const sample = Array.from({ length: 4 }).map((_, i) => mapMissionToCard({
        id: `m-${i}`,
        title: `Örnek Görev ${i + 1}`,
        brand_name: ['Marka A','Marka B','Marka C'][i % 3],
        brand_logo: 'https://via.placeholder.com/50',
        brand_id: `b-${i}`,
        cover_url: `https://picsum.photos/seed/mission${i}/900/600`,
        created_at: new Date().toISOString(),
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 1000 * 60 * (60 + i * 10)).toISOString(),
        qp_reward: Math.floor(Math.random()*200)+50,
      }));
      setItems(sample);
      setActiveTab('missions');
    }
  };

  const formatTimeLeft = (startsAt?: string | null, endsAt?: string | null) => {
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
  };

  const fetchProducts = async () => {
    try {
      // Kullanıcının aldığı ürünler: placeholder
      const sample = Array.from({ length: 6 }).map((_, i) => ({
        id: `prod-${i}`,
        image: `https://picsum.photos/seed/prod${i}/400/400`,
        title: 'Ürün',
        subtitle: 'Satın alındı',
      }));
      setItems(sample);
      setActiveTab('products');
    } catch {
      setItems([]);
      setActiveTab('products');
    }
  };

  const fetchFavorites = async () => {
    try {
      // Favoriler: Haftanın Qappiosu kartı için uygun şema
      const sample = Array.from({ length: 6 }).map((_, i) => ({
        id: `fav-${i}`,
        media_type: 'image',
        media_url: `https://picsum.photos/seed/fav${i}/800/800`,
        caption: `Favori Görev ${i + 1}`,
        like_count: Math.floor(Math.random() * 100) + 10,
        comment_count: Math.floor(Math.random() * 20) + 5,
        created_at: new Date().toISOString(),
        is_sponsored: false,
        sponsor_brand: null,
        user: {
          id: user?.id || `user-${i}`,
          display_name: profile?.display_name || 'Ben',
          avatar_url: (profile as any)?.avatar_url,
          level_name: profile?.level_name || 'Snapper',
          level_tier: 1,
        },
        mission: {
          id: `m-${i}`,
          title: `Favori Görev ${i + 1}`,
          brand: {
            id: `b-${i}`,
            name: ['Marka A','Marka B','Marka C'][i % 3],
            logo_url: 'https://via.placeholder.com/50',
          },
        },
        latest_comment: null,
        qp_reward: Math.floor(Math.random() * 200) + 50,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 1000 * 60 * (60 + i * 10)).toISOString(),
      }));
      setItems(sample);
      setActiveTab('favorites');
    } catch {
      setItems([]);
      setActiveTab('favorites');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator />
        <Text className="text-slate-600 mt-2">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header */}
      <View className="px-4 pt-6 pb-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View>
              <View className="w-20 h-20 rounded-full mr-4 overflow-hidden" style={{ borderWidth: 3, borderColor: levelColors.border }}>
                <View className="w-full h-full bg-slate-200">
                {/* Avatar */}
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                ) : null}
                </View>
              </View>
              {/* Level badge under avatar */}
              <View className="items-center mt-2">
                <View className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-200">
                  <Text className="text-emerald-700 text-xs font-bold">{profile?.level_name || 'Snapper'}</Text>
                </View>
              </View>
            </View>
            <View className="ml-4" style={{ maxWidth: '70%' }}>
              <Text className="text-slate-700 text-sm font-semibold mb-0.5">{username}</Text>
              <Text className="text-slate-900 text-xl font-bold mb-1">{profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || 'Kullanıcı'}</Text>
              {/* Short bio in place of city */}
              {!!profile?.bio && (
                <Text className="text-slate-700" numberOfLines={2}>{profile.bio}</Text>
              )}
              {/* Socials in header */}
              {profile?.socials && (
                <View className="flex-row gap-4 mt-2">
                  {profile.socials.twitter && (
                    <Ionicons name="logo-twitter" size={20} color="#1d9bf0" />
                  )}
                  {profile.socials.instagram && (
                    <Ionicons name="logo-instagram" size={20} color="#d62976" />
                  )}
                  {profile.socials.tiktok && (
                    <Ionicons name="logo-tiktok" size={20} color="#000" />
                  )}
                  {profile.socials.facebook && (
                    <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  )}
                </View>
              )}
            </View>
          </View>
          <View className="flex-row gap-2">
            <Pressable className="p-2 rounded-lg border border-slate-300" onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={18} color="#475569" />
            </Pressable>
          </View>
        </View>

        
      </View>

      {/* Stats (compact) on top - 3D Card */}
      <View className="px-4 mt-3">
        <View 
          className="rounded-xl border border-slate-200 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <View className="flex-row justify-between py-3">
            <View className="items-center flex-1">
              <Text className="text-slate-900 text-sm font-bold">{stats.posts}</Text>
              <Text className="text-slate-500 text-[11px]">Gönderi</Text>
            </View>
            <Pressable 
              className="items-center flex-1"
              onPress={() => router.push('/followers')}
            >
              <Text className="text-slate-900 text-sm font-bold">{stats.followers}</Text>
              <Text className="text-slate-500 text-[11px]">Takipçi</Text>
            </Pressable>
            <Pressable 
              className="items-center flex-1"
              onPress={() => router.push('/following')}
            >
              <Text className="text-slate-900 text-sm font-bold">{stats.following}</Text>
              <Text className="text-slate-500 text-[11px]">Takip</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Edit Profile + View toggle (3D card) */}
      <View className="px-4 mt-2">
        <View 
          className="rounded-xl border border-slate-200 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <View className="flex-row gap-2 items-center py-2 px-2">
            <Pressable className="flex-1 py-2 rounded-lg border border-slate-300 items-center" onPress={() => router.push('/profile/edit')}>
              <Text className="text-slate-700 font-semibold">Profili Düzenle</Text>
            </Pressable>
            <Pressable onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="px-3 py-2 rounded-lg border border-slate-300">
              <Ionicons name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} size={18} color="#64748b" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Tabs (flat row, no 3D) */}
      <View className="flex-row justify-around items-center px-4 py-3 border-b border-slate-200">
        <Pressable onPress={fetchPosts} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${activeTab==='posts'?'bg-slate-900':''}`}>
          <Ionicons name="images-outline" size={16} color={activeTab==='posts'?'#fff':'#334155'} />
          <Text className={`${activeTab==='posts'?'text-white':'text-slate-700'} text-sm font-semibold`}>Postlar</Text>
        </Pressable>
        <Pressable onPress={fetchMissions} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${activeTab==='missions'?'bg-slate-900':''}`}>
          <Ionicons name="sparkles-outline" size={16} color={activeTab==='missions'?'#fff':'#334155'} />
          <Text className={`${activeTab==='missions'?'text-white':'text-slate-700'} text-sm font-semibold`}>Qappiolar</Text>
        </Pressable>
        <Pressable onPress={fetchProducts} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${activeTab==='products'?'bg-slate-900':''}`}>
          <Ionicons name="gift-outline" size={16} color={activeTab==='products'?'#fff':'#334155'} />
          <Text className={`${activeTab==='products'?'text-white':'text-slate-700'} text-sm font-semibold`}>Ödüller</Text>
        </Pressable>
        <Pressable onPress={fetchFavorites} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${activeTab==='favorites'?'bg-slate-900':''}`}>
          <Ionicons name="heart-outline" size={16} color={activeTab==='favorites'?'#fff':'#334155'} />
          <Text className={`${activeTab==='favorites'?'text-white':'text-slate-700'} text-sm font-semibold`}>Favoriler</Text>
        </Pressable>
      </View>

      

      {/* Content */}
      {error ? (
        <View className="px-4 py-3">
          <Text className="text-red-600">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          key={`${activeTab}-${viewMode}`}
          keyExtractor={(it) => it.id}
          numColumns={
            activeTab === 'products'
              ? (viewMode === 'grid' ? 2 : 1)
              : activeTab === 'posts'
                ? (viewMode === 'grid' ? 3 : 1)
                : activeTab === 'missions'
                  ? (viewMode === 'grid' ? 3 : 1)
                  : (viewMode === 'grid' ? 1 : 1) // favorites: grid also 1 column (full-width card)
          }
          columnWrapperStyle={viewMode==='grid' && activeTab!=='favorites' ? { justifyContent:'space-between', paddingHorizontal: 12 } : undefined}
          contentContainerStyle={{ paddingHorizontal: viewMode==='grid'?0:12 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            activeTab === 'posts' ? (
              <FeedCard 
                post={item}
                isGridView={viewMode==='grid'}
                onLike={() => {}}
                onComment={() => {}}
                onShare={() => {}}
              />
            ) : activeTab === 'missions' ? (
              viewMode === 'grid' ? (
                <FeedCard
                  post={item}
                  isGridView
                  onLike={() => {}}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ) : (
                // List görünümünde Haftanın Qappiosu kartı tarzı geniş kart
                <View className="mb-2" style={{ width: '100%', paddingHorizontal: 8 }}>
                  <View style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                    <Image source={{ uri: item.media_url }} style={{ width: '100%', height: 200 }} />
                    {/* Koyu overlay */}
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                    {/* Sol üst marka */}
                    {item.mission?.brand && (
                      <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Image source={{ uri: item.mission.brand.logo_url }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{item.mission.brand.name}</Text>
                      </View>
                    )}
                    {/* Sağ üst sayaç + QP */}
                    <View style={{ position: 'absolute', top: 12, right: 12, alignItems: 'flex-end' }}>
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{formatTimeLeft(item.starts_at, item.ends_at)}</Text>
                      </View>
                      <View style={{ borderRadius: 12, overflow: 'hidden' }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ff8c00' }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{item.qp_reward ?? 0} QP</Text>
                        </View>
                      </View>
                    </View>
                    {/* Ortada başlık */}
                    <View style={{ position: 'absolute', top: '50%', left: 12, right: 12, transform: [{ translateY: -10 }] }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{item.caption}</Text>
                    </View>
                    {/* Alt aksiyonlar */}
                    <View style={{ position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="share-outline" size={20} color="#fff" />
                      </View>
                      <View style={{ borderRadius: 12, overflow: 'hidden', minWidth: 120 }}>
                        <View style={{ paddingVertical: 8, backgroundColor: '#006064' }}>
                          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Keşfet…</Text>
                        </View>
                      </View>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="heart-outline" size={20} color="#fff" />
                      </View>
                    </View>
                  </View>
                </View>
              )
            ) : activeTab === 'products' ? (
              // Aldıklarım: Market sayfasındaki kartlar
              viewMode === 'grid' ? (
                <View className="mb-3" style={{ width: '48%' }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <Image source={{ uri: item.image }} style={{ height: 120, borderRadius: 8, marginBottom: 8 }} />
                    <View>
                      <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {!!item.brandLogo && (<Image source={{ uri: item.brandLogo }} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#e5e7eb' }} />)}
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.brandName || item.brand || ''}</Text>
                      </View>
                      <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', backgroundColor: '#f59e0b' }}>
                          <Ionicons name="star" size={12} color="#ffffff" />
                          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', marginLeft: 4 }}> {item.price} QP</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="cube-outline" size={12} color="#374151" style={{ marginRight: 4 }} />
                          <Text style={{ color: '#374151', fontSize: 10, fontWeight: '700' }}>Stok: {item.stock ?? 0}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="mb-2" style={{ width: '100%' }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row' }}>
                    <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>{item.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {!!item.brandLogo && (<Image source={{ uri: item.brandLogo }} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#e5e7eb' }} />)}
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>{item.brandName || item.brand || ''}</Text>
                          </View>
                        </View>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#f59e0b' }}>
                            <Ionicons name="star" size={14} color="#ffffff" />
                            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>{item.price} QP</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="cube-outline" size={14} color="#374151" style={{ marginRight: 6 }} />
                          <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700' }}>Stok: {item.stock ?? 0}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            ) : activeTab === 'favorites' ? (
              // Favoriler: Grid görünümde Haftanın Qappiosu kart stili
              viewMode === 'grid' ? (
                <View className="mb-2" style={{ width: '100%', paddingHorizontal: 8 }}>
                  <View style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                    <Image source={{ uri: item.media_url }} style={{ width: '100%', height: 200 }} />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                    {item.mission?.brand && (
                      <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Image source={{ uri: item.mission.brand.logo_url }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{item.mission.brand.name}</Text>
                      </View>
                    )}
                    <View style={{ position: 'absolute', top: 12, right: 12, alignItems: 'flex-end' }}>
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{formatTimeLeft(item.starts_at, item.ends_at)}</Text>
                      </View>
                      <View style={{ borderRadius: 12, overflow: 'hidden' }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ff8c00' }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{item.qp_reward ?? 0} QP</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ position: 'absolute', top: '50%', left: 12, right: 12, transform: [{ translateY: -10 }] }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{item.caption}</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="share-outline" size={20} color="#fff" />
                      </View>
                      <View style={{ borderRadius: 12, overflow: 'hidden', minWidth: 120 }}>
                        <View style={{ paddingVertical: 8, backgroundColor: '#006064' }}>
                          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Keşfet…</Text>
                        </View>
                      </View>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="heart-outline" size={20} color="#fff" />
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                // List görünümde basit satır (favoriler için istek grid'te özel tasarımdı)
                <View className="flex-row items-center gap-3 px-1 py-2 border-b border-slate-100">
                  <View className="w-16 h-16 rounded-md overflow-hidden bg-slate-200">
                    <Image source={{ uri: item.media_url }} style={{ width: '100%', height: '100%' }} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-semibold" numberOfLines={1}>{item.caption}</Text>
                    <Text className="text-slate-500 text-xs" numberOfLines={1}>{item.mission?.brand?.name || 'Görev'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
              )
            ) : (
              viewMode === 'grid' ? (
                <View className="mb-3" style={{ width: '32%' }}>
                  <View className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3 px-1 py-2 border-b border-slate-100">
                  <View className="w-16 h-16 rounded-md overflow-hidden bg-slate-200">
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-semibold" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-slate-500 text-xs" numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
              )
            )
          )}
          ListEmptyComponent={<View className="py-8"><Text className="text-slate-400 text-center">Henüz içerik yok</Text></View>}
        />
      )}

      {/* Footer spacing */}
      <View className="h-2" />
    </ScrollView>
  );
}

