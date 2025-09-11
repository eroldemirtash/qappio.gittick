import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Modal, FlatList, Linking, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/src/lib/supabase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const modalScrollViewRef = useRef<ScrollView>(null);

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedMarketplace, setResolvedMarketplace] = useState<Array<{id: number|string; name: string; logo: string; url: string}>>([]);
  
  // Animation states
  const purchaseButtonScale = useRef(new Animated.Value(1)).current;
  const modalButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Supabase'den ürün detayını çek
        const { data: product, error: productErr } = await supabase
          .from('products')
          .select(`
            id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, category, level, usage_terms, created_at
          `)
          .eq('id', id)
          .single();
        
        console.log('📱 Raw product from Supabase:', product);
        
        if (productErr) throw productErr;
        
        // Marka verisini ayrı sorguyla çek
        let brandData = null;
        if (product.brand_id) {
          const { data: brand, error: brandErr } = await supabase
            .from('brands')
            .select(`
              id, name, logo_url, socials,
              brand_profiles(avatar_url, cover_url, website, email, phone)
            `)
            .eq('id', product.brand_id)
            .single();
          
          if (!brandErr && brand) {
            brandData = brand;
          }
        }
        
        // Ürün görsellerini çek
        const { data: images } = await supabase
          .from('product_images')
          .select('url, is_cover, position')
          .eq('product_id', id)
          .order('position');
        
        // Marketplace linklerini çek (varsa)
        const { data: marketplaces } = await supabase
          .from('product_marketplaces')
          .select('marketplace, url')
          .eq('product_id', id);
        
        const productData = {
          ...product,
          brand: brandData,
          product_images: images || [],
          product_marketplaces: marketplaces || [],
          brandId: product.brand_id || brandData?.id, // brand_id yoksa brand?.id kullan
        };
        
        console.log('📱 Product detail Supabase response:', productData);
        console.log('📱 Original product brand_id:', product.brand_id);
        console.log('📱 Brand data for mapping:', {
          brandName: productData.brand?.name,
          brand: productData.brand,
          brand_profiles: productData.brand?.brand_profiles
        });
        console.log('📱 Brand ID for navigation:', productData.brandId);
        setItem(productData);
      } catch (e: any) {
        console.log('Product detail error:', e?.message || e);
        setError('Ürün verisi alınamadı');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => controller.abort();
  }, [id]);

  // Mock fallback (geçici)
  const products = [
    { 
      id: 1, 
      name: 'iPhone 15 Pro', 
      brand: 'Apple',
      brandId: '1',
      stock: 5, 
      price: 2500, 
      level: 4, 
      category: 'Elektronik',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10df588fb0?w=400&h=400&fit=crop&crop=center',
      description: 'En yeni iPhone 15 Pro. A17 Pro çip, 48MP ana kamera, ProRAW ve ProRes kayıt. Titanium gövde ve Ceramic Shield ekran.',
      images: [
        'https://images.unsplash.com/photo-1592899677977-9c10df588fb0?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center',
      ],
      features: [
        'A17 Pro çip',
        '48MP ana kamera',
        'ProRAW ve ProRes',
        'Titanium gövde',
        'Ceramic Shield ekran'
      ],
      brandInfo: {
        name: 'Apple',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center',
        coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center',
        website: 'www.apple.com',
        email: 'info@apple.com',
      phone: '0212 555 0123',
      socials: {}
    },
    marketplaceLinks: [
      {
        id: 1,
        name: 'Trendyol',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://trendyol.com'
      },
      {
        id: 2,
        name: 'Hepsiburada',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://hepsiburada.com'
      },
      {
        id: 3,
        name: 'Pazarama',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://pazarama.com'
      }
    ]
  },
  { 
    id: 2, 
    name: 'Nike Air Max', 
    brand: 'Nike',
    brandId: '2',
    stock: 12, 
    price: 800, 
    level: 2, 
    category: 'Spor',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
    description: 'Klasik Nike Air Max spor ayakkabısı. Rahat ve şık tasarım. Günlük kullanım için ideal.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
    ],
    features: [
      'Rahat tasarım',
      'Hava yastığı',
      'Dayanıklı malzeme',
      'Günlük kullanım',
      'Çok renk seçeneği'
    ],
    brandInfo: {
      name: 'Nike',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center',
      website: 'www.nike.com',
      email: 'info@nike.com',
      phone: '0212 555 0124',
      socials: {}
    },
    marketplaceLinks: [
      {
        id: 1,
        name: 'Trendyol',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://trendyol.com'
      },
      {
        id: 2,
        name: 'Hepsiburada',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://hepsiburada.com'
      },
      {
        id: 3,
        name: 'Pazarama',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://pazarama.com'
      }
    ]
  },
  { 
    id: 3, 
    name: 'Samsung Galaxy', 
    brand: 'Samsung',
    brandId: '3',
    stock: 8, 
    price: 1800, 
    level: 3, 
    category: 'Elektronik',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
    description: 'Samsung Galaxy serisi telefon. Yüksek performans ve uzun pil ömrü. Android işletim sistemi.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center',
    ],
    features: [
      'Android işletim sistemi',
      'Yüksek performans',
      'Uzun pil ömrü',
      'Çoklu kamera',
      '5G desteği'
    ],
    brandInfo: {
      name: 'Samsung',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center',
      website: 'www.samsung.com',
      email: 'info@samsung.com',
      phone: '0212 555 0125',
      socials: {}
    },
    marketplaceLinks: [
      {
        id: 1,
        name: 'Trendyol',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://trendyol.com'
      },
      {
        id: 2,
        name: 'Hepsiburada',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://hepsiburada.com'
      },
      {
        id: 3,
        name: 'Pazarama',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
        url: 'https://pazarama.com'
      }
    ]
  }
  ];

  const product = item ? {
    id: item.id,
    name: item.name || item.title,
    brand: item.brandName || item.brand?.name,
    brandId: item.brand_id || item.brand?.id || item.brandId,
    stock: item.stock || item.stock_count || 0,
    price: item.price || item.value_qp || item.price_qp || 0,
    level: item.level || 1,
    category: item.category || 'Elektronik',
    image: item.image || item.image_url || item.cover_url,
    images: (() => {
      // Önce product_images tablosundan gelen görselleri kontrol et
      if (item.product_images && Array.isArray(item.product_images) && item.product_images.length > 0) {
        return item.product_images.map((img: any) => img.url);
      }
      // Sonra images array'ini kontrol et
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        return item.images;
      }
      // Son olarak tek görsel varsa onu kullan
      const singleImage = item.image || item.image_url || item.cover_url;
      return singleImage ? [singleImage] : [];
    })(),
    description: item.description || '',
    features: Array.isArray(item.features) ? item.features : [],
    brandInfo: {
      name: item.brand?.name || 'Marka',
      logo: item.brand?.brand_profiles?.avatar_url || item.brand?.logo_url,
      coverImage: item.brand?.brand_profiles?.cover_url || item.image || item.image_url,
      website: item.brand?.brand_profiles?.website,
      email: item.brand?.brand_profiles?.email,
      phone: item.brand?.brand_profiles?.phone || '',
      socials: item.brand?.socials || item.brand?.brand_profiles?.socials || {}
    },
    marketplaceLinks: (() => {
      // marketplace_links array'ini kontrol et
      if (item.marketplace_links && Array.isArray(item.marketplace_links)) {
        return item.marketplace_links.map((m: any, i: number) => ({
          id: m.id ?? i,
          name: m.marketplace || m.name || 'Link',
          logo: m.image_url || m.logo || item.image || item.image_url,
          url: m.product_url || m.url || '#'
        }));
      }
      // Eski marketplace array formatını kontrol et
      if (item.marketplace && Array.isArray(item.marketplace)) {
        return item.marketplace.map((m: any, i: number) => ({
          id: m.id ?? i,
          name: (m.name) ?? 'Link',
          logo: (m.logo) ?? (item.image || item.image_url),
          url: m.url ?? '#'
        }));
      }
      return [];
    })()
  } : (products.find(p => p.id.toString() === id) || products[0]);

  // Resolve marketplace logos from provided URLs (og:image/twitter:image) if missing
  useEffect(() => {
    const abort = new AbortController();
    const run = async () => {
      try {
        const links = (product?.marketplaceLinks ?? []).slice(0, 6); // limit a bit
        const base = process.env.EXPO_PUBLIC_ADMIN_API_BASE || 'http://192.168.1.167:3010';
        const resolved = await Promise.all(links.map(async (mk: { id: number | string; name: string; logo: string; url: string }) => {
          const fallback = mk.logo || product.image || (product.images && product.images[0]) || '';
          if (!mk.url) return { ...mk, logo: fallback };
          try {
            const res = await fetch(`${base}/api/og-image?url=${encodeURIComponent(mk.url)}`, { signal: abort.signal });
            if (!res.ok) return { ...mk, logo: fallback };
            const j = await res.json();
            const found = (j?.image as string) || '';
            return { ...mk, logo: found || fallback };
          } catch {
            return { ...mk, logo: fallback };
          }
        }));
        setResolvedMarketplace(resolved);
      } catch {}
    };
    run();
    return () => abort.abort();
  }, [item?.id]);

  const levelColors: { [key: number]: string } = {
    1: '#fbbf24', // Snapper - Sarı
    2: '#10b981', // Seeker - Yeşil
    3: '#8b5cf6', // Crafter - Mor
    4: '#ef4444', // Viralist - Kırmızı
    5: '#1e40af', // Qappian - Lacivert
  };

  const levelNames: { [key: number]: string } = {
    1: 'Snapper',
    2: 'Seeker', 
    3: 'Crafter',
    4: 'Viralist',
    5: 'Qappian',
  };

  const animateButton = (scaleValue: Animated.Value, callback?: () => void) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 30,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 30,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handlePurchase = async () => {
    // Hızlı animasyon
    Animated.timing(purchaseButtonScale, {
      toValue: 0.95,
      duration: 20,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(purchaseButtonScale, {
        toValue: 1,
        duration: 20,
        useNativeDriver: true,
      }).start();
    });

    try {
      const base = process.env.EXPO_PUBLIC_ADMIN_API_BASE || 'http://192.168.1.184:3010';
      const res = await fetch(`${base}/api/mobile/market/${product.id}/purchase`, { method: 'POST' });
      const json = await res.json();
      if (res.ok && typeof json.stock === 'number') {
        setItem((prev: any) => prev ? { ...prev, stock: json.stock } : prev);
      }
      // Modal'ı hemen aç
      setPurchaseModalVisible(true);
    } catch {
      // Modal'ı hemen aç
      setPurchaseModalVisible(true);
    }
  };

  // Level kontrolü - gerçekte kullanıcının level'ı Supabase'den gelecek
  const userLevel = 1; // Mock user level - Snapper seviyesi
  const levels = [
    { id: 1, name: 'Snapper' },
    { id: 2, name: 'Seeker' },
    { id: 3, name: 'Crafter' },
    { id: 4, name: 'Viralist' },
    { id: 5, name: 'Qappian' },
  ];
  const requiredLevel = product.level;
  const canPurchase = userLevel >= requiredLevel;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#6b7280' }}>Ürün yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <Pressable 
          onPress={() => router.back()}
          style={{ backgroundColor: '#00bcd4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#6b7280' }}>Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Brand Card */}
                <View style={styles.brandCard}>
                  <Image source={{ uri: product.brandInfo.coverImage }} style={styles.brandCoverImage} />
                  <View style={styles.brandOverlay} />
                  
                  {/* Marka Logosu - Sol üst köşe */}
                  <Pressable 
                    style={styles.brandLogoContainer}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      console.log('Marka logosuna tıklandı!');
                      console.log('Brand ID:', product.brandId);
                      if (product.brandId) {
                        console.log('Marka profil sayfasına gidiliyor...');
                        router.push(`/brands/${product.brandId}`);
                      } else {
                        console.log('Brand ID yok!');
                      }
                    }}
                  >
                    <Image source={{ uri: product.brandInfo.logo }} style={styles.brandLogo} />
                  </Pressable>
                  
                  {/* Marka Bilgileri - Logonun yanında */}
                  <View style={styles.brandInfo}>
                    <Pressable 
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        console.log('Marka adına tıklandı!');
                        console.log('Brand ID:', product.brandId);
                        if (product.brandId) {
                          console.log('Marka profil sayfasına gidiliyor...');
                          router.push(`/brands/${product.brandId}`);
                        } else {
                          console.log('Brand ID yok!');
                        }
                      }}
                    >
                      <Text style={styles.brandName}>{product.brandInfo.name}</Text>
                    </Pressable>
                    <Pressable onPress={() => { if (product.brandInfo.website) Linking.openURL(product.brandInfo.website.startsWith('http') ? product.brandInfo.website : `https://${product.brandInfo.website}`); }}>
                      <Text style={styles.brandWebsite}>{product.brandInfo.website || 'Website'}</Text>
                    </Pressable>
                  </View>
                  
                  {/* Mail ve Sosyal Medya - Kartın içinde alt kısım */}
                  <View style={styles.brandContact}>
                    <Pressable onPress={() => { if (product.brandInfo.email) Linking.openURL(`mailto:${product.brandInfo.email}`); }}>
                      <Text style={styles.contactText}>{product.brandInfo.email || 'E-posta'}</Text>
                    </Pressable>
                    <View style={styles.socialIcons}>
                      {!!(product.brandInfo.socials?.twitter) && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.twitter)}>
                          <Ionicons name="logo-twitter" size={20} color="#ffffff" />
                        </Pressable>
                      )}
                      {!!(product.brandInfo.socials?.instagram) && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.instagram)}>
                          <Ionicons name="logo-instagram" size={20} color="#ffffff" />
                        </Pressable>
                      )}
                      {!!(product.brandInfo.socials?.facebook) && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.facebook)}>
                          <Ionicons name="logo-facebook" size={20} color="#ffffff" />
                        </Pressable>
                      )}
                      {!!(product.brandInfo.socials?.linkedin) && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.linkedin)}>
                          <Ionicons name="logo-linkedin" size={20} color="#ffffff" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>

        {/* Marketplace Links */}
        <View style={styles.marketplaceSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketplaceScroll}>
            {(resolvedMarketplace.length ? resolvedMarketplace : product.marketplaceLinks).map((marketplace: { id: number | string; name: string; logo: string; url: string }) => (
              <Pressable
                key={marketplace.id}
                style={styles.marketplaceItem}
                onPress={() => Linking.openURL(marketplace.url)}
              >
                <Image
                  source={{ uri: marketplace.logo || product.image || (product.images && product.images[0]) }}
                  style={styles.marketplaceImage}
                />
                <View style={styles.marketplaceOverlay}>
                  <Text style={styles.marketplaceName}>{marketplace.name}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Product Images Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            pagingEnabled
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {product.images.map((image: string, index: number) => (
              <Pressable
                key={index}
                onPress={() => {
                  setModalImageIndex(index);
                  setImageModalVisible(true);
                }}
                style={styles.carouselImageContainer}
              >
                <Image source={{ uri: image }} style={styles.carouselImage} />
              </Pressable>
            ))}
          </ScrollView>
          
          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {product.images.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info Card */}
        <View style={styles.productInfoCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
          </View>
          <Text style={styles.productSubtitle}>Ürün ve Kullanım Koşulları</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Özellikler:</Text>
            {product.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Purchase Section */}
        <View style={styles.purchaseSection}>
          <View style={styles.pointsContainer}>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsLabel}>Qappio Param</Text>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qpValueBadge}
              >
                <Ionicons name="star" size={16} color="#ffffff" />
                <Text style={styles.qpValueText}>{product.price} QP</Text>
              </LinearGradient>
            </View>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsLabel}>Ödül Değeri</Text>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.qpValueBadge}
              >
                <Ionicons name="gift" size={16} color="#ffffff" />
                <Text style={styles.qpValueText}>{product.price} QP</Text>
              </LinearGradient>
            </View>
          </View>
          
          <Animated.View style={{ transform: [{ scale: purchaseButtonScale }] }}>
            <Pressable 
              style={[styles.purchaseButton, !canPurchase && styles.purchaseButtonDisabled]} 
              onPress={canPurchase ? handlePurchase : undefined}
              disabled={!canPurchase}
            >
              {canPurchase ? (
                <LinearGradient
                  colors={['#00bcd4', '#0097a7', '#006064']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.purchaseButtonGradient}
                >
                  <Text style={styles.purchaseButtonText}>
                    Aldım gitti!
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.levelInsufficientContainer}>
                  <Text style={styles.levelInsufficientText}>
                    Seviye Yetersiz
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Purchase Success Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={purchaseModalVisible}
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <Pressable 
              style={styles.modalCloseButton}
              onPress={() => setPurchaseModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>

            {/* Product Image */}
            <View style={styles.modalProductImageContainer}>
              <Image 
                source={{ uri: product.images[0] }} 
                style={styles.modalProductImage} 
              />
              <View style={styles.modalImageOverlay}>
                <Ionicons name="checkmark-circle" size={40} color="#10b981" />
              </View>
            </View>

            {/* Product Name */}
            <Text style={styles.modalProductName}>{product.name}</Text>

            {/* Congratulations Message */}
            <View style={styles.modalCongratsContainer}>
              <Text style={styles.modalCongratsText}>
                Tebrikler Snapper! 🎉
              </Text>
              <Text style={styles.modalLevelText}>
                {product.name} artık senin! ;)
              </Text>
              <Text style={styles.modalMotivationText}>
                Qappish'lemeye devam et!!!
              </Text>
            </View>

            {/* Info Text */}
            <View style={styles.modalInfoContainer}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.modalInfoText}>
                Ürünün size sağlıklı ulaştırılması için lütfen kişisel bilgilerinizi girdiğinizden emin olun.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonsContainer}>
              <Animated.View style={{ flex: 1, transform: [{ scale: modalButtonScale }] }}>
                <Pressable 
                  style={styles.modalButtonSecondary}
                  onPress={() => {
                    // Hızlı animasyon
                    Animated.timing(modalButtonScale, {
                      toValue: 0.95,
                      duration: 20,
                      useNativeDriver: true,
                    }).start(() => {
                      Animated.timing(modalButtonScale, {
                        toValue: 1,
                        duration: 20,
                        useNativeDriver: true,
                      }).start();
                    });
                    setPurchaseModalVisible(false);
                  }}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f9fafb', '#f3f4f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Tamam</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
              <Animated.View style={{ flex: 1, transform: [{ scale: modalButtonScale }] }}>
                <Pressable 
                  style={styles.modalButtonPrimary}
                  onPress={() => {
                    // Hızlı animasyon
                    Animated.timing(modalButtonScale, {
                      toValue: 0.95,
                      duration: 20,
                      useNativeDriver: true,
                    }).start(() => {
                      Animated.timing(modalButtonScale, {
                        toValue: 1,
                        duration: 20,
                        useNativeDriver: true,
                      }).start();
                    });
                    setPurchaseModalVisible(false);
                    // TODO: Navigate to profile or settings
                  }}
                >
                  <LinearGradient
                    colors={['#00bcd4', '#0097a7', '#006064']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Bilgilerimi Güncelle</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            {/* Close Button */}
            <Pressable 
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </Pressable>

            {/* Image Gallery */}
            <ScrollView 
              ref={modalScrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              pagingEnabled
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setModalImageIndex(index);
              }}
            >
              {product.images.map((image: string, index: number) => (
                <View key={index} style={styles.modalImageContainer}>
                  <Image source={{ uri: image }} style={styles.modalImage} />
                </View>
              ))}
            </ScrollView>
            
            {/* Dot Indicators */}
            <View style={styles.modalDotContainer}>
              {product.images.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.modalDot,
                    index === modalImageIndex ? styles.modalActiveDot : styles.modalInactiveDot
                  ]}
                />
              ))}
            </View>
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
  // Brand Card
  brandCard: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandCoverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  brandOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  brandContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'contain',
  },
  brandInfo: {
    position: 'absolute',
    top: 16,
    left: 72,
    right: 16,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandWebsite: {
    color: '#ffffff',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandContact: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  contactText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  websiteText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  // Marketplace Section
  marketplaceSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  marketplaceTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  marketplaceScroll: {
    flexDirection: 'row',
  },
  marketplaceItem: {
    width: 100,
    height: 60,
    marginRight: 12,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  marketplaceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  marketplaceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketplaceName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Image Carousel
  imageCarousel: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  carouselImageContainer: {
    width: width - 32,
    height: 120,
    marginRight: 8,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#00bcd4',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalImageContainer: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width - 40,
    height: width - 40,
    resizeMode: 'contain',
  },
  modalDotContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  modalActiveDot: {
    backgroundColor: '#ffffff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalInactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  // Product Info Card
  productInfoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  productSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  levelTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productDescription: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#374151',
    fontSize: 14,
    marginLeft: 8,
  },
  // Purchase Section
  purchaseSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pointsItem: {
    alignItems: 'center',
  },
  pointsLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  // QP Value Badges
  qpValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 4,
  },
  qpValueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  purchaseButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  purchaseButtonTextDisabled: {
    color: '#9ca3af',
  },
  levelInsufficientContainer: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelInsufficientText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  modalProductImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  modalProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProductName: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalCongratsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCongratsText: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalLevelText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMotivationText: {
    color: '#00bcd4',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  modalInfoText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  modalButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 44,
  },
  modalButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  modalButtonSecondaryText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 44,
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
