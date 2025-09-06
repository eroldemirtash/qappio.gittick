import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { card3DStyles } from '@/src/theme/card3D';
import { supabase } from '@/src/lib/supabase';

const { width } = Dimensions.get('window');

export default function QappiosScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappios', headerTitleAlign: 'center' });
  }, [navigation]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const [featuredMissions, setFeaturedMissions] = useState<any[]>([]);
  const [regularMissions, setRegularMissions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);

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

  const fetchMissions = async () => {
    console.log('🔍 Fetching missions from Supabase...');
    const { data, error } = await supabase
      .from('v_missions_public')
      .select('id,title,cover_url,brand_name,brand_logo,qp_reward,starts_at,ends_at,is_qappio_of_week,is_sponsored,sponsor_brand_name,sponsor_brand_logo')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    console.log('✅ Supabase data:', data);
    
    if (data && data.length > 0) {
      const mapped = data.map((m: any) => ({
        id: m.id,
        title: m.title,
        brand: m.brand_name || '',
        brandLogo: m.brand_logo || 'https://via.placeholder.com/50',
        image: m.cover_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
        qpValue: m.qp_reward ?? 0,
        timeLeft: formatTimeLeft(m.starts_at, m.ends_at),
        isFeatured: m.is_qappio_of_week || false,
        is_sponsored: m.is_sponsored || false,
        sponsor_brand: m.is_sponsored ? {
          id: 'sponsor-' + m.id,
          name: m.sponsor_brand_name || 'Sponsor',
          logo_url: m.sponsor_brand_logo || 'https://via.placeholder.com/30'
        } : null,
      }));
      console.log('📝 Mapped missions:', mapped);
      
      // Separate featured and regular missions
      const featured = mapped.filter((m: any) => m.isFeatured);
      const regular = mapped.filter((m: any) => !m.isFeatured);
      
      setFeaturedMissions(featured);
      setRegularMissions(regular);
    } else {
      console.log('⚠️ No published missions found');
    }
  };

  const fetchBrands = async () => {
    console.log('🔍 Fetching brands from Supabase...');
    const { data, error } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        brand_profiles!left(logo_url, avatar_url)
      `);
    
    if (error) {
      console.error('❌ Supabase brands error:', error);
      return;
    }
    
    console.log('✅ Supabase brands data:', data);
    
    if (data && data.length > 0) {
      const mapped = data.map((b: any) => ({
        id: b.id,
        name: b.name,
        logo: b.brand_profiles?.logo_url || b.brand_profiles?.avatar_url || 'https://via.placeholder.com/50',
      }));
      setBrands(mapped);
    } else {
      console.log('⚠️ No brands found');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMissions(), fetchBrands()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMissions();
    fetchBrands();
  }, []);

  const handleMissionPress = (missionId: string) => {
    router.push(`/missions/${missionId}`);
  };

  const MissionCard = ({ mission, isHorizontal = false, isGrid = false }: { mission: any, isHorizontal?: boolean, isGrid?: boolean }) => {
    const [exploreScale] = useState(new Animated.Value(1));

    const handleExplorePress = () => {
      // Tıklama animasyonu
      Animated.sequence([
        Animated.timing(exploreScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(exploreScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Görev detay sayfasına git
      handleMissionPress(mission.id);
    };

    return (
      <Pressable
        style={[
          styles.missionCard, 
          isHorizontal && styles.missionCardHorizontal,
          isGrid && styles.missionCardGrid
        ]}
        onPress={() => handleMissionPress(mission.id)}
      >
        <Image source={{ uri: mission.image }} style={styles.missionImage} />
        <View style={styles.missionOverlay} />
        
        {/* Brand Logo and Name - Top Left */}
        <View style={styles.brandInfo}>
          <Image source={{ uri: mission.brandLogo }} style={styles.brandLogo} />
          <Text style={styles.brandName}>{mission.brand}</Text>
        </View>

        {/* Sponsored By - Below Brand Info */}
        {mission.is_sponsored && mission.sponsor_brand && (
          <View style={styles.sponsoredChip}>
            <Text style={styles.sponsoredByText}>Sponsored by</Text>
            <Image source={{ uri: mission.sponsor_brand.logo_url }} style={styles.sponsorLogo} />
            <Text style={styles.sponsorText}>{mission.sponsor_brand.name}</Text>
          </View>
        )}

        {/* Countdown and QP - Top Right */}
        <View style={styles.topRightContainer}>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{mission.timeLeft}</Text>
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

        {/* Mission Title - Center */}
        <View style={styles.titleContainer}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
        </View>

        {/* Action Buttons and Explore Button - Bottom */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </Pressable>
          <Animated.View style={{ transform: [{ scale: exploreScale }] }}>
            <Pressable style={styles.exploreButtonCompact} onPress={handleExplorePress}>
              <LinearGradient
                colors={['#00bcd4', '#0097a7', '#006064']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreGradientCompact}
              >
                <Text style={styles.exploreTextCompact}>Keşfet…</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <Pressable style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const BrandItem = ({ brand }: { brand: any }) => (
    <View style={styles.brandItem}>
      <Image source={{ uri: brand.logo }} style={styles.brandItemLogo} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <Text style={styles.searchPlaceholder}>Görev ara...</Text>
        </View>
        <Pressable
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={16} 
            color="#1e293b" 
          />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
          />
        }
      >
        {/* Haftanın Qappiosu - Only show if there are featured missions */}
        {featuredMissions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Haftanın Qappiosu</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.featuredScroll}
              pagingEnabled
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
                setCurrentFeaturedIndex(index);
              }}
            >
              {featuredMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} isHorizontal={true} />
              ))}
            </ScrollView>
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {featuredMissions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentFeaturedIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Brands */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
            {brands.map((brand) => (
              <BrandItem key={brand.id} brand={brand} />
            ))}
          </ScrollView>
        </View>

        {/* Regular Missions */}
        {regularMissions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Diğer Görevler</Text>
            </View>
            {viewMode === 'grid' ? (
              <View style={styles.missionsGrid}>
                {regularMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} isGrid={true} />
                ))}
              </View>
            ) : (
              <View style={styles.missionsList}>
                {regularMissions.map((mission) => (
                  <View key={mission.id} style={styles.missionListItem}>
                    <Image source={{ uri: mission.image }} style={styles.missionListImage} />
                    <View style={styles.missionListInfo}>
                      <Text style={styles.missionListTitle}>{mission.title}</Text>
                      <Text style={styles.missionListBrand}>{mission.brand}</Text>
                      {mission.is_sponsored && mission.sponsor_brand && (
                        <View style={styles.missionListSponsored}>
                          <Text style={styles.missionListSponsoredText}>Sponsored by {mission.sponsor_brand.name}</Text>
                        </View>
                      )}
                      <Text style={styles.missionListTime}>{mission.timeLeft}</Text>
                    </View>
                    <View style={styles.missionListQp}>
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
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
  },
  viewToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
  },
  featuredScroll: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  missionCard: {
    ...card3DStyles.card3DMission,
    width: width - 16,
    height: 200,
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  missionCardHorizontal: {
    width: width - 16,
  },
  missionCardGrid: {
    width: width - 16,
    height: 200,
    marginBottom: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  brandInfo: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  brandName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sponsoredChip: {
    position: 'absolute',
    top: 50, // Below brand info
    left: 12,
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
  topRightContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'flex-end',
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  countdownText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  qpContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  qpGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qpText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  titleContainer: {
    position: 'absolute',
    top: '50%',
    left: 12,
    right: 12,
    transform: [{ translateY: -10 }],
  },
  missionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreButtonCompact: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 120,
    marginHorizontal: 8,
  },
  exploreGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreGradientCompact: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  exploreTextCompact: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  brandsScroll: {
    paddingLeft: 16,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 75,
  },
  brandItemLogo: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  missionsGrid: {
    paddingHorizontal: 8,
    gap: 12,
  },
  missionsList: {
    paddingHorizontal: 8,
    gap: 6,
  },
  missionListItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  missionListImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  missionListInfo: {
    flex: 1,
  },
  missionListTitle: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionListBrand: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  missionListSponsored: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  missionListSponsoredText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '600',
  },
  missionListTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  missionListQp: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#1e293b',
  },
});