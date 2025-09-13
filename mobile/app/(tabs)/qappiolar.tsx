import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Animated, RefreshControl, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { card3DStyles } from '@/src/theme/card3D';
import { supabase } from '@/src/lib/supabase';
import { fonts } from '@/src/utils/fonts';

const { width } = Dimensions.get('window');

export default function QappiolarScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappio', headerTitleAlign: 'center' });
  }, [navigation]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [filteredMissions, setFilteredMissions] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'qp' | 'time' | 'participation'>('qp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortModal, setShowSortModal] = useState(false);

  // SADECE GERÇEK SUPABASE VERİLERİ - MOCK DATA YOK!
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

  // Search function
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredMissions([]);
      return;
    }
    
    const allMissions = [...featuredMissions, ...regularMissions];
    const filtered = allMissions.filter(mission => {
      const searchLower = text.toLowerCase();
      return (
        mission.title?.toLowerCase().includes(searchLower) ||
        mission.description?.toLowerCase().includes(searchLower) ||
        mission.brief?.toLowerCase().includes(searchLower) ||
        mission.brand?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredMissions(filtered);
  };

  // Sort function
  const sortMissions = (missions: any[]) => {
    return [...missions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'qp':
          aValue = a.qpValue || 0;
          bValue = b.qpValue || 0;
          break;
        case 'time':
          // Time left parsing - convert to minutes for comparison
          const parseTime = (timeStr: string) => {
            if (!timeStr || timeStr === 'Sona erdi' || timeStr === 'Yakında') return 0;
            const parts = timeStr.match(/(\d+)g|(\d+)s|(\d+)dk/g);
            if (!parts) return 0;
            let totalMinutes = 0;
            parts.forEach(part => {
              if (part.includes('g')) totalMinutes += parseInt(part) * 24 * 60;
              else if (part.includes('s')) totalMinutes += parseInt(part) * 60;
              else if (part.includes('dk')) totalMinutes += parseInt(part);
            });
            return totalMinutes;
          };
          aValue = parseTime(a.timeLeft);
          bValue = parseTime(b.timeLeft);
          break;
        case 'participation':
          aValue = a.totalPosts || 0;
          bValue = b.totalPosts || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const fetchMissions = async () => {
    try {
      console.log('🚀 FETCHING REAL MISSIONS FROM SUPABASE (NO MOCK DATA!)');
      console.log('🔍 Supabase client:', supabase);
      
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('missions')
        .select('id, title')
        .limit(1);
      
      console.log('🔍 Test query result:', { testData, testError });
      
      if (testError) {
        console.error('❌ Test query failed:', testError);
        // Boş liste göster, mock data kullanma!
        setFeaturedMissions([]);
        setRegularMissions([]);
        return;
      }
      
        const { data, error } = await supabase
          .from('missions')
          .select(`
            id,
            title,
            cover_url,
            description,
            qp_reward,
            starts_at,
            ends_at,
            created_at,
            brand_id,
            is_qappio_of_week,
            status,
            brands!missions_brand_id_fkey (
              id,
              name,
              logo_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);
      
      if (error) {
        console.error('❌ Supabase missions error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        // Boş liste göster, mock data kullanma!
        setFeaturedMissions([]);
        setRegularMissions([]);
        return;
      }
      
      console.log('✅ REAL SUPABASE MISSIONS DATA:', data);
      console.log('✅ REAL MISSIONS COUNT:', data?.length || 0);
      console.log('🔍 MISSIONS STATUS VALUES:', data?.map(m => ({ id: m.id, title: m.title, status: m.status })));
      
      if (data && data.length > 0) {
        const mapped = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          brandId: m.brand_id,
          brand: m.brands?.name || 'Bilinmeyen Marka',
          brandLogo: m.brands?.logo_url || 'https://via.placeholder.com/50',
          image: m.cover_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
          qpValue: (m.qp_reward ?? 0),
          timeLeft: formatTimeLeft(m.starts_at, m.ends_at),
          isFeatured: m.is_qappio_of_week || false, // Gerçek değeri kullan
          is_sponsored: false, // Geçici olarak false
          sponsor_brand: null, // Geçici olarak null
          description: m.description || '', // Panel açıklaması
          fullDescription: m.description || '' // Panel açıklaması
        }));
        console.log('📝 MAPPED REAL MISSIONS:', mapped);
        console.log('🌟 FEATURED MISSIONS CHECK:', mapped.map(m => ({ id: m.id, title: m.title, isFeatured: m.isFeatured })));
        
        // Separate featured and regular missions
        const featured = mapped.filter(m => m.isFeatured);
        const regular = mapped.filter(m => !m.isFeatured);
        
        console.log('🌟 FEATURED MISSIONS COUNT:', featured.length);
        console.log('🌟 REGULAR MISSIONS COUNT:', regular.length);
        
        setFeaturedMissions(featured);
        setRegularMissions(regular);
        console.log('🎉 REAL MISSIONS LOADED SUCCESSFULLY - NO MOCK DATA!');
      } else {
        console.log('⚠️ NO PUBLISHED MISSIONS FOUND - SHOWING EMPTY LIST (NO MOCK!)');
        setFeaturedMissions([]);
        setRegularMissions([]);
      }
    } catch (err) {
      console.error('❌ FETCH MISSIONS ERROR:', err);
      // Hata durumunda da boş liste göster, mock data kullanma!
      setFeaturedMissions([]);
      setRegularMissions([]);
    }
  };

  const fetchBrands = async () => {
    console.log('🚀 FETCHING BRANDS THAT HAVE MISSIONS (NO MOCK DATA!)');
    
    // Önce görevlerden unique brand_id'leri al - status kontrolü olmadan
    const { data: missionsData, error: missionsError } = await supabase
      .from('missions')
      .select('brand_id');
    
    if (missionsError) {
      console.error('❌ Supabase missions error for brands:', missionsError);
      setBrands([]);
      return;
    }
    
    console.log('📊 MISSIONS DATA FOR BRANDS:', missionsData);
    
    // Unique brand_id'leri al
    const uniqueBrandIds = [...new Set(missionsData?.map(m => m.brand_id).filter(Boolean))];
    console.log('🎯 UNIQUE BRAND IDS FROM MISSIONS:', uniqueBrandIds);
    
    if (uniqueBrandIds.length === 0) {
      console.log('⚠️ NO BRANDS WITH MISSIONS FOUND');
      setBrands([]);
      return;
    }
    
    // Sadece görev veren markaları çek
    const { data, error } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        logo_url
      `)
      .in('id', uniqueBrandIds);
    
    if (error) {
      console.error('❌ Supabase brands error:', error);
      setBrands([]);
      return;
    }
    
    console.log('✅ BRANDS WITH MISSIONS DATA:', data);
    
    if (data && data.length > 0) {
      const mapped = data.map((b: any) => {
        const logo = b.logo_url || 'https://via.placeholder.com/50';
        return {
          id: b.id,
          name: b.name,
          logo: logo,
        };
      });
      setBrands(mapped);
      console.log('🎉 BRANDS WITH MISSIONS LOADED SUCCESSFULLY!');
    } else {
      console.log('⚠️ NO BRANDS WITH MISSIONS FOUND');
      setBrands([]);
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

  const MissionCard = ({ mission, isHorizontal = false }: { mission: any, isHorizontal?: boolean }) => {
    const [exploreScale] = useState(new Animated.Value(1));
    const [cardScale] = useState(new Animated.Value(1));
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

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

    const handleExplorePress = () => {
      animateButton(exploreScale, () => {
        // Görev detay sayfasına git
        handleMissionPress(mission.id);
      });
    };

    const handleCardPress = () => {
      animateButton(cardScale, () => {
        // Görev detay sayfasına git
        handleMissionPress(mission.id);
      });
    };

    const handleShare = async () => {
      try {
        await Share.share({
          message: `Qappio'da bu görevi gör: ${mission.title}`,
          url: `qappio://mission/${mission.id}`,
        });
        console.log('Görev paylaşıldı:', mission.title);
      } catch (error) {
        console.error('Share error:', error);
      }
    };

    const handleFavorite = () => {
      setIsFavorited(!isFavorited);
      setFavoriteCount((prev: number) => isFavorited ? prev - 1 : prev + 1);
      console.log('Favori durumu değişti:', !isFavorited, mission.title);
    };

    return (
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <Pressable
          style={[styles.missionCard, isHorizontal && styles.missionCardHorizontal]}
          onPress={handleCardPress}
        >
        <Image source={{ uri: mission.image }} style={styles.missionImage} />
        <View style={styles.missionOverlay} />
        
        {/* Brand Logo and Name - Top Left */}
        <View style={styles.brandInfo}>
          <Pressable onPress={() => mission.brandId && router.push(`/brands/${mission.brandId}`)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: mission.brandLogo }} style={styles.brandLogo} />
            <Text style={styles.brandName}>{mission.brand}</Text>
          </Pressable>
        </View>

        {/* Sponsored By - Below Brand Info */}
        {mission.is_sponsored && mission.sponsor_brand && (
          <View style={styles.sponsoredContainer}>
            <Text style={styles.sponsoredByText}>Sponsored by</Text>
            <Image source={{ uri: mission.sponsor_brand.logo_url }} style={styles.sponsorLogo} />
            <Text style={styles.sponsorName}>{mission.sponsor_brand.name}</Text>
          </View>
        )}

        {/* Countdown and QP - Top Right */}
        <View style={styles.topRightContainer}>
          <View style={styles.countdownContainer}>
            <Ionicons name="hourglass-outline" size={12} color="#fff" style={styles.countdownIcon} />
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
          <Pressable 
            style={styles.actionButton}
            onPress={() => animateButton(cardScale, handleShare)}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </Pressable>
          <Animated.View style={{ transform: [{ scale: exploreScale }] }}>
            <Pressable style={styles.exploreButtonCompact} onPress={handleExplorePress}>
              <LinearGradient
                colors={['#06b6d4', '#0ea5e9', '#0284c7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreGradientCompact}
              >
                <Text style={styles.exploreTextCompact}>Keşfet…</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <Pressable 
            style={styles.actionButton}
            onPress={() => animateButton(cardScale, handleFavorite)}
          >
            <Ionicons 
              name={isFavorited ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isFavorited ? "#fbbf24" : "#fff"} 
            />
          </Pressable>
        </View>
        </Pressable>
      </Animated.View>
    );
  };

  const BrandItem = ({ brand }: { brand: any }) => {
    const [brandScale] = useState(new Animated.Value(1));

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

    return (
      <Animated.View style={{ transform: [{ scale: brandScale }] }}>
        <Pressable 
          style={styles.brandItem} 
          onPress={() => animateButton(brandScale, () => router.push(`/brands/${brand.id}`))}
        >
          <Image source={{ uri: brand.logo }} style={styles.brandItemLogo} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Görev ara..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>
        <Pressable
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={16} color="#1e293b" />
        </Pressable>
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
          {brands.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
              {brands.map((brand) => (
                <BrandItem key={brand.id} brand={brand} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Search Results or Regular Missions */}
        {searchText.trim() ? (
          filteredMissions.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, styles.centeredTitle]}>
                Arama Sonuçları
              </Text>
              {viewMode === 'grid' ? (
                <View style={styles.missionsGrid}>
                  {sortMissions(filteredMissions).map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </View>
              ) : (
                <View style={styles.missionsList}>
                  {sortMissions(filteredMissions).map((mission) => (
                    <View key={mission.id} style={styles.missionListItem}>
                      <Image source={{ uri: mission.image }} style={styles.missionListImage} />
                      <View style={styles.missionListInfo}>
                        <Text style={styles.missionListTitle}>{mission.title}</Text>
                        <View style={styles.missionListBrandRow}>
                          <Image source={{ uri: mission.brandLogo }} style={styles.missionListBrandLogo} />
                          <Text style={styles.missionListBrand}>{mission.brand}</Text>
                        </View>
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
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arama Sonucu Bulunamadı</Text>
            <Text style={styles.noResultsText}>
              "{searchText}" için sonuç bulunamadı. Farklı kelimeler deneyin.
            </Text>
          </View>
        )
        ) : (
          /* Regular Missions */
          regularMissions.length > 0 && (
            <View style={styles.section}>
              {viewMode === 'grid' ? (
                <View style={styles.missionsGrid}>
                  {sortMissions(regularMissions).map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </View>
              ) : (
                <View style={styles.missionsList}>
                  {sortMissions(regularMissions).map((mission) => (
                    <View key={mission.id} style={styles.missionListItem}>
                      <Image source={{ uri: mission.image }} style={styles.missionListImage} />
                      <View style={styles.missionListInfo}>
                        <Text style={styles.missionListTitle}>{mission.title}</Text>
                        <View style={styles.missionListBrandRow}>
                          <Image source={{ uri: mission.brandLogo }} style={styles.missionListBrandLogo} />
                          <Text style={styles.missionListBrand}>{mission.brand}</Text>
                        </View>
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
          )
        )}
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sırala</Text>
            
            <View style={styles.sortOptions}>
              <Pressable
                style={[styles.sortOption, sortBy === 'qp' && styles.sortOptionActive]}
                onPress={() => setSortBy('qp')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'qp' && styles.sortOptionTextActive]}>
                  Puana Göre
                </Text>
                {sortBy === 'qp' && (
                  <Ionicons 
                    name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
                    size={16} 
                    color="#06b6d4" 
                  />
                )}
              </Pressable>
              
              <Pressable
                style={[styles.sortOption, sortBy === 'time' && styles.sortOptionActive]}
                onPress={() => setSortBy('time')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'time' && styles.sortOptionTextActive]}>
                  Süreye Göre
                </Text>
                {sortBy === 'time' && (
                  <Ionicons 
                    name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
                    size={16} 
                    color="#06b6d4" 
                  />
                )}
              </Pressable>
              
              <Pressable
                style={[styles.sortOption, sortBy === 'participation' && styles.sortOptionActive]}
                onPress={() => setSortBy('participation')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'participation' && styles.sortOptionTextActive]}>
                  Katılıma Göre
                </Text>
                {sortBy === 'participation' && (
                  <Ionicons 
                    name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
                    size={16} 
                    color="#06b6d4" 
                  />
                )}
              </Pressable>
            </View>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <Text style={styles.modalButtonText}>
                  {sortOrder === 'desc' ? 'Azalan' : 'Artan'}
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowSortModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Tamam
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    width: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
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
  sortButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
  noResultsText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
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
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '700',
  },
  centeredTitle: {
    textAlign: 'center',
  },

  featuredScroll: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  missionCard: {
    ...card3DStyles.card3DMission,
    width: width - 32,
    height: 200,
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  missionCardHorizontal: {
    width: width - 32,
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
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
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
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    fontSize: 11,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    fontFamily: fonts.comfortaa.bold,
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
    fontFamily: fonts.comfortaa.bold,
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
    fontFamily: fonts.comfortaa.bold,
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
    marginRight: 12,
    width: 48,
  },
  brandItemLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'contain',
  },
  missionsGrid: {
    paddingHorizontal: 16,
    gap: 8,
  },
  missionsList: {
    paddingHorizontal: 16,
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
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionListBrand: {
    color: '#64748b',
    fontSize: 14,
  },
  missionListBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  missionListBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    resizeMode: 'contain',
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
  // Sponsored By Styles
  sponsoredContainer: {
    position: 'absolute',
    top: 50, // brandInfo'nun altında (top: 12 + height + margin)
    left: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 100,
  },
  sponsoredByText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '500',
    marginRight: 2,
  },
  sponsorLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 2,
  },
  sponsorName: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    width: '85%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  sortOptions: {
    marginBottom: 24,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 0,
  },
  sortOptionActive: {
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#475569',
    fontFamily: fonts.comfortaa.regular,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  sortOptionTextActive: {
    color: '#fff',
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 0,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: -0.2,
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
  emptyBrandsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyBrandsText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
