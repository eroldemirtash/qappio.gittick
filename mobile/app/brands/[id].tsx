import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, StyleSheet, Pressable, Dimensions, ActivityIndicator, FlatList, ImageBackground, Linking, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';
import { card3DStyles } from '@/src/theme/card3D';

const { width } = Dimensions.get('window');

type Brand = {
  id: string;
  name: string;
  category?: string | null;
  email?: string | null;
  website_url?: string | null;
  followers?: number | null;
  socials?: Record<string, string> | null;
  description?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  cover_url?: string | null;
  brand_profiles?: { avatar_url?: string | null; logo_url?: string | null } | null;
};

type Mission = {
  id: string;
  title: string;
  brand_id?: string | null;
  cover_url?: string | null;
  brief?: string | null;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  published?: boolean | null;
};

type Product = {
  id: string;
  title?: string | null;
  brand_id?: string | null;
  cover_url?: string | null;
  is_active?: boolean | null;
};

export default function BrandProfileScreen() {
  const { id } = useLocalSearchParams();
  const brandId = String(id || '');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(brandId);
  const [resolvedBrandId, setResolvedBrandId] = useState<string | null>(null);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'missions' | 'products'>('missions');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMissionExpiredModal, setShowMissionExpiredModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Geri sayım fonksiyonu (görev kartındaki gibi)
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
      return '2g 15s 30dk'; // Fallback
    }
  };

  // Görev kartına tıklama fonksiyonu
  const handleMissionPress = (mission: any) => {
    const now = new Date();
    const end = mission.ends_at ? new Date(mission.ends_at) : null;
    
    // Görev bitmişse eğlenceli modal aç
    if (end && now >= end) {
      setShowMissionExpiredModal(true);
      return;
    }
    
    // Görev aktifse detay sayfasına git
    router.push(`/missions/${mission.id}`);
  };

  // Takip etme fonksiyonu
  const handleFollow = async () => {
    console.log('🔔 Takip butonu tıklandı!', { brandId, isFollowing });
    
    if (!brandId) {
      console.log('❌ BrandId yok');
      return;
    }
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('❌ Kullanıcı giriş yapmamış');
        // Giriş yapmamış kullanıcı için login sayfasına yönlendir
        router.push('/(auth)/login');
        return;
      }

      console.log('👤 Kullanıcı:', currentUser.id);
      console.log('🏢 Marka ID:', brandId);

      // Önce tablo var mı kontrol et
      const { data: tableCheck } = await supabase
        .from('brand_follows')
        .select('id')
        .limit(1);
      
      console.log('📋 Tablo kontrolü:', { tableCheck });

      if (isFollowing) {
        console.log('📤 Takibi bırakıyor...');
        // Takibi bırak
        const { error } = await supabase
          .from('brand_follows')
          .delete()
          .eq('brand_id', brandId)
          .eq('user_id', currentUser.id);
        
        console.log('📤 Takibi bırakma sonucu:', { error });
        
        if (!error) {
          setIsFollowing(false);
          setFollowerCount(prev => Math.max(0, prev - 1));
          console.log('✅ Takip bırakıldı');
          
          // Panel verilerini güncelle
          updatePanelStats(brandId, 'unfollow', currentUser.id);
        }
      } else {
        console.log('📥 Takip ediyor...');
        // Takip et
        const { error } = await supabase
          .from('brand_follows')
          .insert({
            brand_id: brandId,
            user_id: currentUser.id
          });
        
        console.log('📥 Takip etme sonucu:', { error });
        
        if (!error) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          console.log('✅ Takip edildi');
          
          // Panel verilerini güncelle
          updatePanelStats(brandId, 'follow', currentUser.id);
        }
      }
    } catch (err) {
      console.error('❌ Takip hatası:', err);
    }
  };

  // Mesaj gönderme fonksiyonu
  const handleMessage = () => {
    // Mesaj sayfası oluşturulacak
    router.push(`/messages/${brandId}`);
  };

  // Panel verilerini güncelleme fonksiyonu
  const updatePanelStats = async (brandId: string, action: 'follow' | 'unfollow', userId: string) => {
    try {
      const adminApiUrl = process.env.EXPO_PUBLIC_ADMIN_API_BASE || 'http://localhost:3000';
      
      const response = await fetch(`${adminApiUrl}/api/brands/${brandId}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'follow',
          data: {
            user_id: userId,
            action: action
          }
        })
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('📊 Panel verileri güncellendi:', stats);
      } else {
        console.log('⚠️ Panel güncelleme hatası:', response.status);
      }
    } catch (error) {
      console.error('❌ Panel güncelleme hatası:', error);
    }
  };

  const load = useCallback(async () => {
    if (!brandId) return;
    setError(null);
    setLoading(true);
    try {
      // Brand (primary) - brands tablosundan çek
      let b: any = null; let be: any = null;
      if (isUuid) {
        const res = await supabase
          .from('brands')
          .select('*')
          .eq('id', brandId)
          .maybeSingle();
        b = res.data as any; be = res.error;
      } else {
        const res = await supabase
          .from('brands')
          .select('*')
          .ilike('name', `%${brandId}%`)
          .maybeSingle();
        b = res.data as any; be = res.error;
      }
      let effectiveId: string | null = null;
      if (b) {
        setBrand(b as any);
        effectiveId = (b as any).id;
        setResolvedBrandId(effectiveId);

        // Takip durumu ve takipçi sayısını çek
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          // Takip durumu
          const { data: followData } = await supabase
            .from('brand_follows')
            .select('id')
            .eq('brand_id', effectiveId)
            .eq('user_id', currentUser.id)
            .maybeSingle();
          
          setIsFollowing(!!followData);

          // Takipçi sayısı
          const { count: followerCountData } = await supabase
            .from('brand_follows')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', effectiveId);
          
          setFollowerCount(followerCountData || 0);
        }
      } else if (isUuid) {
        // Fallback: derive from a published mission join (RLS for missions allows anon)
        const { data: mb } = await supabase
          .from('missions')
          .select('brand_id, brands!missions_brand_id_fkey(name, logo_url)')
          .eq('brand_id', brandId)
          .limit(1);
        const derived = (mb && mb[0]) ? {
          id: mb[0].brand_id,
          name: (mb[0].brands as any)?.name,
          brand_profiles: { avatar_url: (mb[0].brands as any)?.logo_url, logo_url: (mb[0].brands as any)?.logo_url },
        } : null;
        if (derived) {
          setBrand(derived);
          effectiveId = (derived as any).id;
          setResolvedBrandId(effectiveId);
        }
      }

      // Merge panel brand_profiles (handles/website/display_name) if available
      if (effectiveId) {
        try {
          const profRes = await supabase
            .from('brand_profiles')
            .select('display_name, category, description, email, website, social_instagram, social_twitter, social_facebook, social_linkedin, avatar_url, cover_url')
            .eq('brand_id', effectiveId)
            .maybeSingle();
          
          const brandRes = await supabase
            .from('brands')
            .select('name, category, description, logo_url')
            .eq('id', effectiveId)
            .maybeSingle();
            
          if (profRes.data || brandRes.data) {
            const p: any = profRes.data;
            const br: any = brandRes.data;
            const toUrl = (platform: 'instagram'|'facebook'|'linkedin'|'twitter', value?: string | null) => {
              if (!value) return undefined;
              const v = String(value).trim();
              if (!v) return undefined;
              if (/^https?:\/\//i.test(v)) return v;
              const h = v.replace(/^@+/, '');
              const base: Record<typeof platform, string> = {
                instagram: 'https://instagram.com/',
                facebook: 'https://facebook.com/',
                linkedin: 'https://www.linkedin.com/',
                twitter: 'https://twitter.com/'
              } as const;
              return `${base[platform]}${h}`;
            };
            
            const merged: any = {
              ...(b || {}),
              name: p?.display_name || br?.name || (b as any)?.name,
              category: p?.category || br?.category || (b as any)?.category,
              description: p?.description || br?.description || (b as any)?.description,
              email: p.email || (b as any)?.email,
              website_url: (p.website ? (/^https?:\/\//i.test(p.website) ? p.website : `https://${p.website}`) : (b as any)?.website_url),
              socials: {
                ...((b as any)?.socials || {}),
                instagram: toUrl('instagram', p.social_instagram) || ((b as any)?.socials || {}).instagram,
                twitter:   toUrl('twitter',   p.social_twitter)   || ((b as any)?.socials || {}).twitter,
                facebook:  toUrl('facebook',  p.social_facebook)  || ((b as any)?.socials || {}).facebook,
                linkedin:  toUrl('linkedin',  p.social_linkedin)  || ((b as any)?.socials || {}).linkedin,
              },
              cover_url: (b as any)?.cover_url || p.cover_url,
              logo_url: (b as any)?.logo_url || p.avatar_url,
            };
            setBrand(merged);
          }
        } catch {}
      }

      // Son bir fallback: missions üzerinden marka adı/logo çek
      if (!brand && !b) {
        try {
          const vm = await supabase
            .from('missions')
            .select('brand_id, brands!missions_brand_id_fkey(name, logo_url)')
            .or(isUuid ? `brand_id.eq.${brandId}` : `brands.name.ilike.%${brandId}%`)
            .limit(1)
            .maybeSingle();
          if (vm.data) {
            const d: any = vm.data;
            const fallbackBrand = {
              id: d.brand_id || brandId,
              name: (d.brands as any)?.name || 'Marka',
              category: null,
              email: null,
              website_url: null,
              followers: null,
              cover_url: null,
              brand_profiles: { avatar_url: (d.brands as any)?.logo_url, logo_url: (d.brands as any)?.logo_url },
            } as Brand as any;
            setBrand(fallbackBrand);
            effectiveId = d.brand_id || null;
            setResolvedBrandId(effectiveId);
          }
        } catch {}
      }

      // Missions (published or null)
      let ms: any[] | null = null; let me: any = null;
      if (effectiveId) {
        const res = await supabase
          .from('missions')
          .select(`id,title,brand_id,cover_url,brief,description,starts_at,ends_at,published,reward_qp`)
          .eq('brand_id', effectiveId)
          .order('created_at', { ascending: false });
        ms = res.data as any[]; me = res.error;
        console.log('🔍 Missions debug:', { effectiveId, ms, me });
      } else {
        // İsme göre missions + brands join
        const res = await supabase
          .from('missions')
          .select(`id,title,brand_id,cover_url,brief,description,starts_at,ends_at,reward_qp,brands!missions_brand_id_fkey(name, logo_url)`)
          .ilike('brands.name', `%${brandId}%`)
          .order('created_at', { ascending: false });
        ms = res.data as any[]; me = res.error;
        console.log('🔍 Missions by name debug:', { brandId, ms, me });
      }
      if (me) throw me;
      
      // Mock veriler ekle (gerçek uygulamada bu veriler submissions tablosundan gelecek)
      const missionsWithStats = (ms || []).map(mission => ({
        ...mission,
        total_likes: Math.floor(Math.random() * 100) + 10, // 10-110 arası rastgele
        total_posts: Math.floor(Math.random() * 50) + 5,   // 5-55 arası rastgele
      }));
      
      setMissions(missionsWithStats);

      // Products (if table exists)
      try {
        if (effectiveId) {
          const { data: ps } = await supabase
            .from('products')
            .select(`id,title,brand_id,cover_url,is_active`)
            .eq('brand_id', effectiveId)
            .order('created_at', { ascending: false });
          console.log('🔍 Products debug:', { effectiveId, ps });
          setProducts((ps as any) || []);
        } else {
          const { data: ps } = await supabase
            .from('products')
            .select(`id,title,brand_id,cover_url,is_active,brands!products_brand_id_fkey(name)`) 
            .ilike('brands.name', `%${brandId}%`)
            .order('created_at', { ascending: false });
          console.log('🔍 Products by name debug:', { brandId, ps });
          setProducts((ps as any) || []);
        }
      } catch (e) {
        console.log('🔍 Products error:', e);
        setProducts([]);
      }
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const now = Date.now();
  // User profil ile tutarlılık: mevcut/geçmiş ayırmadan tüm görevleri tek listede göster
  const allMissions = useMemo(() => missions, [missions]);

  const activeProducts = useMemo(() => products.filter(p => p.is_active ?? true), [products]);
  const pastProducts = useMemo(() => products.filter(p => !(p.is_active ?? true)), [products]);

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator /></View>
    );
  }

  // Fallback: marka bilgisi çekilemezse boş bir kabuk ile devam et
  const brandSafe: Brand = brand || {
    id: brandId,
    name: 'Marka',
    category: null,
    email: null,
    followers: null,
    cover_url: null,
    brand_profiles: null,
  };

  const logo = (brandSafe as any).logo_url || (brandSafe.brand_profiles as any)?.logo_url || (brandSafe.brand_profiles as any)?.avatar_url || '';
  const cover = brandSafe.cover_url || (brandSafe.brand_profiles as any)?.cover_url || 'https://picsum.photos/seed/brandcover/1200/600';
  const socialsBase = (brandSafe.socials || {}) as Record<string, string>;
  const socials: Record<string, string> = {
    instagram: socialsBase.instagram || (brandSafe as any).instagram_url || '',
    facebook:  socialsBase.facebook  || (brandSafe as any).facebook_url  || '',
    linkedin:  socialsBase.linkedin  || (brandSafe as any).linkedin_url  || '',
    twitter:   socialsBase.twitter   || (brandSafe as any).twitter_url   || '',
  };
  
  // Debug: sosyal medya verilerini kontrol et
  console.log('🔍 Brand socials debug:', {
    brandSafe: brandSafe,
    socialsBase: socialsBase,
    socials: socials,
    hasInstagram: !!socials.instagram,
    hasFacebook: !!socials.facebook,
    hasLinkedin: !!socials.linkedin,
    hasTwitter: !!socials.twitter
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 24 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header – user profil yapısı ile aynı hiyerarşi */}
      <View style={styles.profileHeaderWrap}>
        <ImageBackground source={{ uri: cover }} style={styles.headerBg} imageStyle={styles.headerBgImg}>
          <View style={styles.headerOverlayBg} />
          <View style={styles.headerContentRow}>
            <View style={styles.avatarBigWrap}>
              <View style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }}>
                {!!logo && (<Image source={{ uri: logo }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />)}
              </View>
            </View>
            <View style={{ marginLeft: 12, maxWidth: '75%' }}>
              <Text style={[styles.fullnameText, { color: '#ffffff' }]} numberOfLines={1}>{brandSafe.name}</Text>
              {!!brandSafe.category && (<Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>{brandSafe.category}</Text>)}
              {!!brandSafe.email && (<Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>{brandSafe.email}</Text>)}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Web & Sosyal Satırı */}
      <View style={styles.infoRowWrap}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!!brandSafe.website_url && (
            <Pressable style={styles.infoChip} onPress={() => Linking.openURL(String(brandSafe.website_url))}>
              <Ionicons name="globe-outline" size={14} color="#0f172a" />
              <Text style={styles.infoChipText} numberOfLines={1} ellipsizeMode="tail">{brandSafe.website_url}</Text>
            </Pressable>
          )}
          <View style={styles.socialIcons}>
            {!!socials?.instagram && (
              <Pressable onPress={() => Linking.openURL(socials.instagram)}>
                <Ionicons name="logo-instagram" size={18} color="#0f172a" />
              </Pressable>
            )}
            {!!socials?.facebook && (
              <Pressable onPress={() => Linking.openURL(socials.facebook)}>
                <Ionicons name="logo-facebook" size={18} color="#0f172a" />
              </Pressable>
            )}
            {!!socials?.linkedin && (
              <Pressable onPress={() => Linking.openURL(socials.linkedin)}>
                <Ionicons name="logo-linkedin" size={18} color="#0f172a" />
              </Pressable>
            )}
            {!!socials?.twitter && (
              <Pressable onPress={() => Linking.openURL(socials.twitter)}>
                <Ionicons name="logo-twitter" size={18} color="#0f172a" />
              </Pressable>
            )}
          </View>
        </View>
        {(brandSafe.description && brandSafe.description.trim()) && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: '#334155', fontSize: 13 }}>{brandSafe.description}</Text>
          </View>
        )}
      </View>

      {/* Stats card */}
      <View style={styles.cardOuterPad}>
        <View style={styles.cardSurface}>
          <View style={styles.statsRow3}>
            <View style={styles.statsCell}><Text style={styles.statsValue}>{missions.length}</Text><Text style={styles.statsLabel}>Görev</Text></View>
            <View style={styles.statsCell}><Text style={styles.statsValue}>{followerCount}</Text><Text style={styles.statsLabel}>Takipçi</Text></View>
            <View style={styles.statsCell}><Text style={styles.statsValue}>{products.length}</Text><Text style={styles.statsLabel}>Ürün</Text></View>
          </View>
        </View>
      </View>

      {/* Actions + View toggle (aynı kart yapısı) */}
      <View style={styles.cardOuterPad}>
        <View style={styles.cardSurface}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 8 }}>
            <Pressable 
              style={isFollowing ? styles.outlinePill : styles.primaryPill} 
              onPress={handleFollow}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              pressRetentionOffset={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={isFollowing ? styles.outlinePillText : styles.primaryPillText}>
                {isFollowing ? 'Takipten Çık' : 'Takip Et'}
              </Text>
            </Pressable>
            <Pressable style={styles.outlinePill} onPress={handleMessage}>
              <Text style={styles.outlinePillText}>Mesaj</Text>
            </Pressable>
            <Pressable onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} style={styles.iconBtn}>
              <Ionicons name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} size={18} color="#64748b" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Tabs – kullanıcı profildeki stil */}
      <View style={styles.tabsFlatRow}>
        <Pressable onPress={() => setTab('missions')} style={[styles.flatTabBtn, tab==='missions' && styles.flatTabActive]}>
          <Ionicons name="sparkles-outline" size={16} color={tab==='missions'?'#fff':'#334155'} />
          <Text style={[styles.flatTabText, tab==='missions' && styles.flatTabTextActive]}>Qappiolar</Text>
        </Pressable>
        <Pressable onPress={() => setTab('products')} style={[styles.flatTabBtn, tab==='products' && styles.flatTabActive]}>
          <Ionicons name="gift-outline" size={16} color={tab==='products'?'#fff':'#334155'} />
          <Text style={[styles.flatTabText, tab==='products' && styles.flatTabTextActive]}>Ödüller</Text>
        </Pressable>
      </View>

      {/* Content – kullanıcı profildeki FlatList yapısı */}
      <FlatList
        data={tab==='missions' ? allMissions : products}
        key={`${tab}-${viewMode}`}
        keyExtractor={(it:any) => it.id}
        numColumns={tab==='products' ? (viewMode==='grid'?2:1) : (viewMode==='grid'?3:1)}
        columnWrapperStyle={viewMode==='grid' ? { justifyContent:'space-between', paddingHorizontal: 12 } : undefined}
        contentContainerStyle={{ paddingHorizontal: viewMode==='grid'?0:12 }}
        scrollEnabled={false}
        renderItem={({ item }: { item: any }) => (
          tab==='missions' ? (
            viewMode==='grid' ? (
              <Pressable onPress={() => handleMissionPress(item)} style={{ flex: 1, marginHorizontal: 2, marginBottom: 8 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                  <Image source={{ uri: item.cover_url || 'https://picsum.photos/seed/m/800/800' }} style={{ width: '100%', height: 80, borderRadius: 8, marginBottom: 8 }} />
                  <Text style={{ color: '#111827', fontSize: 12, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>{item.title}</Text>
                  
                  {/* QP, Beğeni, Post sayıları */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <View style={{ borderRadius: 8, overflow: 'hidden', shadowColor: '#ffd700', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 }}>
                      <LinearGradient
                        colors={['#ffd700', '#ffb347', '#ff8c00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Ionicons name="diamond" size={10} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', marginLeft: 2, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 } }}>{item.reward_qp || 0}</Text>
                      </LinearGradient>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="heart" size={12} color="#ef4444" />
                      <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '600', marginLeft: 2 }}>{item.total_likes || 0}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="images" size={12} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: '600', marginLeft: 2 }}>{item.total_posts || 0}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ) : (
              <Pressable onPress={() => handleMissionPress(item)} style={{ width: '100%', marginBottom: 12 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                  <Image source={{ uri: item.cover_url || 'https://picsum.photos/seed/m/1200/800' }} style={{ width: '100%', height: 200 }} />
                  <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                  
                  {/* Üst bilgiler */}
                  <View style={{ position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flex: 1, marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }} numberOfLines={2}>{item.title}</Text>
                    </View>
                    <View style={{ borderRadius: 12, overflow: 'hidden', shadowColor: '#ffd700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }}>
                      <LinearGradient
                        colors={['#ffd700', '#ffb347', '#ff8c00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 } }}>{item.reward_qp || 0} QP</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Alt bilgiler - Tek şerit siyah koyu saydam bant */}
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 12, paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="heart" size={14} color="#ef4444" />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>{item.total_likes || 0}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="images" size={14} color="#3b82f6" />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>{item.total_posts || 0}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="hourglass" size={14} color="#10b981" />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                          {formatTimeLeft(item.starts_at, item.ends_at) || 'Süresiz'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            )
          ) : (
            viewMode==='grid' ? (
              <View style={{ width: '48%', marginBottom: 12 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <Image source={{ uri: item.cover_url || 'https://picsum.photos/seed/p/400/400' }} style={{ height: 120, borderRadius: 8, marginBottom: 8 }} />
                  <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }} numberOfLines={2}>{item.title || 'Ürün'}</Text>
                </View>
              </View>
            ) : (
              <View style={{ width: '100%', marginBottom: 8 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row' }}>
                  <Image source={{ uri: item.cover_url || 'https://picsum.photos/seed/p/400/400' }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }} numberOfLines={1}>{item.title || 'Ürün'}</Text>
                  </View>
                </View>
              </View>
            )
          )
        )}
        ListEmptyComponent={<View style={{ paddingVertical: 32 }}><Text style={{ color: '#94a3b8', textAlign: 'center' }}>Henüz içerik yok</Text></View>}
      />

      {/* Görev Bitmiş Modal */}
      <Modal
        visible={showMissionExpiredModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMissionExpiredModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Emoji ve başlık */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalEmoji}>😢</Text>
                <Text style={styles.modalTitle}>Tüh! Kaçırdın Görevi</Text>
                <Text style={styles.modalSubtitle}>Bu görev süresi dolmuş, ama merak etme!</Text>
              </View>

              {/* İçerik */}
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Daha fazla eğlenceli görev için Qappiolar sayfasını ziyaret et! 
                  Yeni görevler her zaman ekleniyor ve seni bekliyor! 🚀
                </Text>
                
                <View style={styles.modalFeatures}>
                  <View style={styles.modalFeature}>
                    <Ionicons name="sparkles" size={20} color="#10b981" />
                    <Text style={styles.modalFeatureText}>Yeni görevler</Text>
                  </View>
                  <View style={styles.modalFeature}>
                    <Ionicons name="diamond" size={20} color="#f59e0b" />
                    <Text style={styles.modalFeatureText}>QP kazanma</Text>
                  </View>
                  <View style={styles.modalFeature}>
                    <Ionicons name="trophy" size={20} color="#8b5cf6" />
                    <Text style={styles.modalFeatureText}>Ödüller</Text>
                  </View>
                </View>
              </View>

              {/* Butonlar */}
              <View style={styles.modalButtons}>
                <Pressable 
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowMissionExpiredModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Tamam</Text>
                </Pressable>
                <Pressable 
                  style={styles.modalButtonPrimary}
                  onPress={() => {
                    setShowMissionExpiredModal(false);
                    router.push('/(tabs)/qappiolar');
                  }}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalButtonGradient}
                  >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.modalButtonPrimaryText}>Qappiolar'a Git</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
      {children}
    </View>
  );
}

function CardGrid({ data, emptyText, onPress, isProduct }: { data: any[]; emptyText: string; onPress: (item: any) => void; isProduct?: boolean }) {
  if (!data || data.length === 0) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }
  return (
    <View style={styles.gridWrap}>
      {data.map((item) => (
        <Pressable key={item.id} onPress={() => onPress(item)} style={[styles.gridCard, card3DStyles.card3DMission]}> 
          <View style={styles.gridCover}>
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.gridCoverImg} />
            ) : (
              <View style={[styles.gridCoverImg, { backgroundColor: '#e2e8f0' }]} />
            )}
          </View>
          <View style={styles.gridBody}>
            <Text numberOfLines={1} style={styles.gridTitle}>{item.title || (isProduct ? 'Ürün' : 'Görev')}</Text>
            {!isProduct && (
              <Text numberOfLines={2} style={styles.gridDesc}>{item.description || item.brief || ''}</Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#ef4444', fontSize: 14, marginBottom: 12, fontWeight: '600' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0ea5e9', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  // Header (user profil ile hizalı)
  profileHeaderWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 },
  headerBg: { width: '100%', height: 180, justifyContent: 'flex-end', borderRadius: 16, overflow: 'hidden' },
  headerBgImg: { resizeMode: 'cover', borderRadius: 16 },
  headerOverlayBg: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 0, paddingHorizontal: 0 },
  headerContentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 },
  avatarBigWrap: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 3, borderColor: '#ffffff' },
  fullnameText: { color: '#0f172a', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  bioShort: { color: '#334155', fontSize: 12 },
  iconBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  infoRowWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  infoChipText: { color: '#0f172a', fontSize: 12, fontWeight: '600' },
  socialIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  // Card yüzeyi (istatistik ve aksiyon kutuları)
  cardOuterPad: { paddingHorizontal: 16, marginTop: 12 },
  cardSurface: { borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
  statsRow3: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  statsCell: { alignItems: 'center', flex: 1 },
  statsValue: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  statsLabel: { color: '#64748b', fontSize: 11 },

  // Actions & tabs
  primaryPill: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  primaryPillText: { color: '#1f2937', fontSize: 14, fontWeight: '600' },
  outlinePill: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  outlinePillText: { color: '#1f2937', fontSize: 14, fontWeight: '600' },
  tabsFlatRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  flatTabBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  flatTabActive: { backgroundColor: '#0f172a' },
  flatTabText: { color: '#334155', fontSize: 14, fontWeight: '600' },
  flatTabTextActive: { color: '#ffffff' },

  headerCard: { margin: 16, overflow: 'hidden', ...card3DStyles.card3DMission },
  coverWrap: { width: '100%', height: 220, position: 'relative' },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  centerTitleWrap: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
  centerTitleBadge: { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  titleText: { color: '#ffffff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  handleText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  logoFloatBox: { position: 'absolute', left: 16, bottom: -36, width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#14b8a6', overflow: 'hidden', backgroundColor: '#fff' },
  logoFloatImg: { width: '100%', height: '100%', borderRadius: 48 },
  topRightIcon: { position: 'absolute', right: 12, top: 12 },
  actionsRow: { marginTop: 52, paddingHorizontal: 16, flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  actionPill: { flex: 1, height: 56, borderRadius: 28, backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  followPill: { backgroundColor: '#ffffff' },
  actionPillText: { color: '#0ea5e9', fontSize: 18, fontWeight: '800' },
  socialRow: { marginTop: 16, paddingHorizontal: 16, flexDirection: 'row', gap: 16 },
  bioBox: { paddingHorizontal: 16, marginTop: 12 },
  bioText: { color: '#0f172a', fontSize: 16 },
  tabsRow: { marginTop: 16, paddingHorizontal: 16, flexDirection: 'row', gap: 12 },
  tabPill: { flex: 1, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  tabPillActive: { backgroundColor: 'linear-gradient(90deg, #1d4ed8, #06b6d4)' },
  tabText: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  tabTextActive: { color: '#0ea5e9' },

  sectionCard: { marginTop: 36, marginHorizontal: 16, borderRadius: 16, padding: 12, backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  sectionCount: { color: '#334155', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#64748b', fontSize: 12, padding: 8 },

  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: (width - 16 * 2 - 12) / 2, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  gridCover: { width: '100%', height: 96, backgroundColor: '#e2e8f0' },
  gridCoverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridBody: { padding: 8 },
  gridTitle: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  gridDesc: { color: '#334155', fontSize: 11, marginTop: 2 },

  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalFeature: {
    alignItems: 'center',
    flex: 1,
  },
  modalFeatureText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalButtonPrimary: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});


