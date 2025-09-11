import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';

export default function MarketScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(1); // Default: Tümü

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Market' });
  }, [navigation]);

  // Mock data - gerçekte Supabase'den gelecek
  const userLevel = 3; // 1-5 arası

  // Remote products from Supabase
  const [remoteProducts, setRemoteProducts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = React.useCallback((): (() => void) => {
    let active = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('products')
          .select(`
            id,
            title,
            brand_id,
            value_qp,
            stock_count,
            is_active,
            category,
            level
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        if (err) throw err;
        const items = (data || []) as any[];

        // 2. Ürün görsellerini ayrı sorguda çek ve map'le
        const productIds = Array.from(new Set(items.map(p => p.id).filter(Boolean)));
        let imagesMap: Record<string, { url: string; is_cover?: boolean; position?: number }[]> = {};
        if (productIds.length > 0) {
          const { data: imgs, error: imgErr } = await supabase
            .from('product_images')
            .select('product_id, url, is_cover, position')
            .in('product_id', productIds);
          if (!imgErr && imgs) {
            for (const img of imgs as any[]) {
              const pid = img.product_id as string;
              if (!imagesMap[pid]) imagesMap[pid] = [];
              imagesMap[pid].push({ url: img.url, is_cover: img.is_cover, position: img.position });
            }
          }
        }

        // 3. Markaları tek sorguda çek (join ismi problemi yaşamamak için)
        const brandIds = Array.from(new Set(items.map(p => p.brand_id).filter(Boolean)));
        let brandMap: Record<string, { name?: string; logo?: string }> = {};
        if (brandIds.length > 0) {
          const { data: br, error: brErr } = await supabase
            .from('brands')
            .select('id, name, brand_profiles(logo_url, avatar_url)')
            .in('id', brandIds);
          if (!brErr && br) {
            brandMap = Object.fromEntries(
              br.map((b: any) => [
                b.id,
                {
                  name: b.name,
                  logo: b.brand_profiles?.logo_url || b.brand_profiles?.avatar_url || undefined,
                },
              ])
            );
          }
        }

        const transformed = items.map((p: any) => {
          const imgs = imagesMap[p.id] || [];
          const coverFromFlag = imgs.find((x:any)=>x.is_cover);
          const coverFromPosition = [...imgs].sort((a:any,b:any)=>(a.position??0)-(b.position??0))[0];
          const coverUrl = (coverFromFlag?.url) || (coverFromPosition?.url) || (p as any).image || 'https://via.placeholder.com/400x400?text=No+Image';
          return {
          id: p.id,
          name: p.name || p.title || p.product_name || 'Ürün',
          brand: brandMap[p.brand_id || '']?.name || 'Bilinmeyen Marka',
          brandName: brandMap[p.brand_id || '']?.name || 'Bilinmeyen Marka',
          brandLogo: brandMap[p.brand_id || '']?.logo,
          stock: p.stock_count ?? p.stock ?? 0,
          price: p.price_qp ?? p.value_qp ?? p.price ?? p.qp ?? 0,
          level: (p as any).level || 1,
          category: p.category || p.category_name || 'Tümü',
          image: coverUrl,
          description: (p as any).description || (p as any).detail || undefined,
          is_active: p.is_active,
        }});
        if (active) setRemoteProducts(transformed);
      } catch (e: any) {
        console.log('Market fetch error', e?.message || e, e?.details || '');
        if (active) {
          setError('Market verileri alınamadı');
          setRemoteProducts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    const cancel = load();
    return () => { if (typeof cancel === 'function') cancel(); };
  }, [load]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);
  
  // Kullanıcının seviyesine göre default kategori seçimi
  React.useEffect(() => {
    if (userLevel <= 2) {
      setSelectedCategory(4); // Spor (düşük seviye)
    } else if (userLevel === 3) {
      setSelectedCategory(2); // Elektronik (orta seviye)
    } else {
      setSelectedCategory(2); // Elektronik (yüksek seviye)
    }
    // Kullanıcının seviyesini seçili reyon olarak ayarla
    setSelectedLevel(userLevel);
  }, [userLevel]);
  const levels = [
    { id: 1, name: 'Snapper', color: '#fbbf24', unlocked: true, points: '0-500' }, // Sarı
    { id: 2, name: 'Seeker', color: '#10b981', unlocked: true, points: '501-1000' }, // Yeşil
    { id: 3, name: 'Crafter', color: '#8b5cf6', unlocked: true, points: '1001-2000' }, // Mor
    { id: 4, name: 'Viralist', color: '#ef4444', unlocked: false, points: '2001-5000' }, // Kırmızı
    { id: 5, name: 'Qappian', color: '#1e40af', unlocked: false, points: '5000+' }, // Lacivert
  ];

  const categories = [
    { id: 1, name: 'Tümü', icon: 'grid-outline' },
    { id: 2, name: 'Elektronik', icon: 'phone-portrait-outline' },
    { id: 3, name: 'Ses & Kulaklık', icon: 'headset-outline' },
    { id: 4, name: 'Gaming & Aksesuar', icon: 'game-controller-outline' },
    { id: 5, name: 'Giyim', icon: 'shirt-outline' },
    { id: 6, name: 'Ayakkabı & Çanta', icon: 'bag-outline' },
    { id: 7, name: 'Aksesuar & Takı', icon: 'sparkles-outline' },
    { id: 8, name: 'Güzellik & Bakım', icon: 'flower-outline' },
    { id: 9, name: 'Spor & Outdoor', icon: 'fitness-outline' },
    { id: 10, name: 'Sağlık & Wellness', icon: 'medkit-outline' },
    { id: 11, name: 'Ev & Yaşam', icon: 'home-outline' },
    { id: 12, name: 'Mutfak & Kahve', icon: 'cafe-outline' },
    { id: 13, name: 'Hobi & DIY', icon: 'construct-outline' },
    { id: 14, name: 'Kırtasiye & Ofis', icon: 'document-text-outline' },
    { id: 15, name: 'Bebek & Çocuk', icon: 'planet-outline' },
    { id: 16, name: 'Evcil Hayvan', icon: 'paw-outline' },
    { id: 17, name: 'Otomotiv', icon: 'car-outline' },
    { id: 18, name: 'Seyahat & Valiz', icon: 'airplane-outline' },
    { id: 19, name: 'Yiyecek & İçecek', icon: 'restaurant-outline' },
    { id: 20, name: 'Dijital / Kodlar', icon: 'qr-code-outline' },
    { id: 21, name: 'Sezonluk & Hediyelik', icon: 'gift-outline' },
  ];

  const products = [
    { 
      id: 1, 
      name: 'iPhone 15 Pro', 
      brand: 'Apple', 
      stock: 5, 
      price: 2500, 
      level: 4, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10df588fb0?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 2, 
      name: 'Nike Air Max', 
      brand: 'Nike', 
      stock: 12, 
      price: 800, 
      level: 2, 
      category: 'Spor',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 3, 
      name: 'Samsung Galaxy', 
      brand: 'Samsung', 
      stock: 8, 
      price: 1800, 
      level: 3, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 4, 
      name: 'Adidas T-Shirt', 
      brand: 'Adidas', 
      stock: 25, 
      price: 150, 
      level: 1, 
      category: 'Giyim',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 5, 
      name: 'MacBook Pro', 
      brand: 'Apple', 
      stock: 3, 
      price: 5000, 
      level: 5, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 6, 
      name: 'Sony WH-1000XM5', 
      brand: 'Sony', 
      stock: 15, 
      price: 1200, 
      level: 3, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 7, 
      name: 'Nike Dri-FIT Hoodie', 
      brand: 'Nike', 
      stock: 20, 
      price: 300, 
      level: 2, 
      category: 'Giyim',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 8, 
      name: 'Samsung Galaxy Watch', 
      brand: 'Samsung', 
      stock: 10, 
      price: 600, 
      level: 3, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 9, 
      name: 'Puma RS-X', 
      brand: 'Puma', 
      stock: 18, 
      price: 450, 
      level: 2, 
      category: 'Spor',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 10, 
      name: 'Apple AirPods Pro', 
      brand: 'Apple', 
      stock: 25, 
      price: 800, 
      level: 3, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 11, 
      name: 'Adidas Ultraboost 22', 
      brand: 'Adidas', 
      stock: 14, 
      price: 700, 
      level: 3, 
      category: 'Spor',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'
    },
    { 
      id: 12, 
      name: 'Samsung 4K TV', 
      brand: 'Samsung', 
      stock: 6, 
      price: 3500, 
      level: 5, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center'
    },
  ];

  const renderLevelBar = () => (
    <View style={styles.levelBarContainer}>
      <View style={styles.levelBarContent}>
        <View style={styles.levelNames}>
          {levels.map((level) => (
            <View key={level.id} style={[
              styles.levelNameContainer,
              level.id === userLevel && styles.levelNameContainerActive
            ]}>
              <Text style={[
                styles.levelNameText, 
                { color: level.color },
                level.id === userLevel && styles.levelNameTextActive
              ]}>
                {level.name}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.levelBar}>
          {levels.map((level, index) => (
            <View
              key={level.id}
              style={[
                styles.levelSegment,
                {
                  backgroundColor: level.unlocked ? level.color : '#374151',
                  opacity: level.unlocked ? 1 : 0.3,
                },
                level.id === userLevel && styles.levelSegmentActive
              ]}
            />
          ))}
        </View>
        <View style={styles.levelLabels}>
          {levels.map((level) => (
            <View key={level.id} style={styles.levelLabel}>
              <Text style={styles.levelPointsText}>{level.points}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* View Toggle Button */}
      <Pressable
        style={styles.viewToggleButton}
        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      >
        <Ionicons 
          name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
          size={20} 
          color="#6b7280" 
        />
      </Pressable>
    </View>
  );

  const renderReyonButtons = () => (
    <View style={styles.reyonContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reyonScroll}>
        {levels.map((level) => (
          <Pressable
            key={level.id}
            style={[
              styles.reyonButton,
              {
                backgroundColor: selectedLevel === level.id 
                  ? level.color 
                  : level.unlocked 
                    ? '#f3f4f6' 
                    : '#f9fafb',
                opacity: level.unlocked ? 1 : 0.5,
              },
              level.id === userLevel && styles.reyonButtonActive
            ]}
            onPress={() => {
              setSelectedLevel(selectedLevel === level.id ? null : level.id);
              console.log(`Filtering by ${level.name} reyonu`);
            }}
          >
            <Text style={styles.reyonButtonText}>{level.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => (
          <Pressable 
            key={category.id} 
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonSelected
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? "#ffffff" : "#6b7280"} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextSelected
            ]}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const handleProductPress = (product: any) => {
    router.push(`/market/${product.id}`);
  };

  const renderProductCard = (product: any) => {
    if (viewMode === 'grid') {
      return (
        <Pressable key={product.id} style={styles.productCardGrid} onPress={() => handleProductPress(product)}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImageGrid}
            resizeMode="cover"
          />
          <View style={styles.productInfoGrid}>
            <Text style={styles.productNameGrid} numberOfLines={2}>{product.name}</Text>
            <View style={styles.brandRowGrid}>
              {!!(product.brandLogo) && (
                <Image
                  source={{ uri: product.brandLogo }}
                  style={styles.brandLogoSmall}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.productBrandGrid}>{product.brandName || product.brand || ''}</Text>
            </View>
            <View style={styles.qpContainerGrid}>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qpBadgeGrid}
              >
                <Ionicons name="star" size={12} color="#ffffff" />
                <Text style={styles.qpTextGrid}>{product.price} QP</Text>
              </LinearGradient>
            </View>
            <View style={styles.productFooterGrid}>
              <View style={styles.stockRowGrid}>
                <Ionicons name="cube-outline" size={12} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.stockTextGrid}>Stok: {product.stock ?? 0}</Text>
              </View>
              {product.level > userLevel && (
                <View style={[styles.levelTagGrid, { backgroundColor: levels[product.level - 1]?.color }]}>
                  <Ionicons name="lock-closed" size={8} color="#fff" style={styles.lockIconInTag} />
                  <Text style={styles.levelTagText}>{levels[product.level - 1]?.name} ol</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable key={product.id} style={styles.productCardList} onPress={() => handleProductPress(product)}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.productImageList}
          resizeMode="cover"
        />
        <View style={styles.productInfoList}>
          <View style={styles.productHeaderList}>
            <View style={styles.productInfo}>
              <Text style={styles.productNameList}>{product.name}</Text>
              <View style={styles.brandRowList}>
                {!!(product.brandLogo) && (
                  <Image
                    source={{ uri: product.brandLogo }}
                    style={styles.brandLogoSmall}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.productBrandList}>{product.brandName || product.brand || ''}</Text>
              </View>
            </View>
            <View style={styles.productPrice}>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qpBadgeList}
              >
                <Ionicons name="star" size={14} color="#ffffff" />
                <Text style={styles.qpTextList}>{product.price} QP</Text>
              </LinearGradient>
            </View>
          </View>
          <View style={styles.productFooterList}>
            <View style={styles.stockRowList}>
              <Ionicons name="cube-outline" size={14} color="#374151" style={{ marginRight: 6 }} />
              <Text style={styles.stockTextList}>Stok: {product.stock ?? 0}</Text>
            </View>
            {product.level > userLevel && (
              <View style={[styles.levelTagList, { backgroundColor: levels[product.level - 1]?.color }]}>
                <Ionicons name="lock-closed" size={10} color="#fff" style={styles.lockIconInTag} />
                <Text style={styles.levelTagTextList}>{levels[product.level - 1]?.name} ol</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  // Use remote products if available, otherwise fallback to local mock data
  const dataSource = remoteProducts || [];

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        {renderLevelBar()}
        {renderReyonButtons()}
        {renderCategories()}
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" colors={["#06b6d4"]} />}>
        {loading && (
          <View style={{ padding: 16 }}>
            <Text>Yükleniyor…</Text>
          </View>
        )}
        {!!error && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#ef4444' }}>{error}</Text>
          </View>
        )}
        <View style={[styles.productsContainer, viewMode === 'grid' && styles.productsGrid]}>
          {dataSource
            .filter(product => {
              const levelMatch = selectedLevel === null || (product.level ?? 1) === selectedLevel;
              const categoryMatch = selectedCategory === null || 
                (selectedCategory === 1) || // Tümü
                categories
                  .filter(c => c.id !== 1)
                  .some(c => c.id === selectedCategory && product.category === c.name);
              return levelMatch && categoryMatch;
            })
            .map(renderProductCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  stickyHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  scrollContent: {
    flex: 1,
  },
  // Level Bar
  levelBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  levelBarContent: {
    flex: 1,
    marginRight: 16,
  },
  levelNames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  levelNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  levelNameContainerActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  levelNameText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelNameTextActive: {
    fontWeight: '700',
    fontSize: 11,
  },
  levelBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelSegment: {
    flex: 1,
    marginRight: 2,
  },
  levelSegmentActive: {
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  levelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  levelLabel: {
    flex: 1,
    alignItems: 'center',
  },
  levelPointsText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  currentLevelText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  // Reyon Buttons
  reyonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  reyonTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reyonScroll: {
    flexDirection: 'row',
  },
  reyonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reyonButtonActive: {
    borderWidth: 2,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  reyonButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  lockIcon: {
    marginLeft: 4,
  },
  // View Toggle Button
  viewToggleButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Categories
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryButtonSelected: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  categoryText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Products
  productsContainer: {
    padding: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Grid View
  productCardGrid: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageGrid: {
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfoGrid: {
    flex: 1,
  },
  productNameGrid: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrandGrid: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  brandRowGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandRowList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  brandLogoSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    resizeMode: 'contain',
  },
  // QP Badge Grid
  qpContainerGrid: {
    marginBottom: 8,
  },
  qpBadgeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  qpTextGrid: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productFooterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockTextGrid: {
    color: '#374151',
    fontSize: 10,
    fontWeight: '700',
  },
  stockRowGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelTagGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelTagText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },
  lockIconInTag: {
    marginRight: 2,
  },
  // List View
  productCardList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageList: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfoList: {
    flex: 1,
  },
  productHeaderList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productNameList: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrandList: {
    color: '#6b7280',
    fontSize: 14,
  },
  // QP Badge List
  qpBadgeList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  qpTextList: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productFooterList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockTextList: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  stockRowList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelTagList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelTagTextList: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  productInfo: {
    flex: 1,
  },
  productPrice: {
    alignItems: 'flex-end',
  },
});
