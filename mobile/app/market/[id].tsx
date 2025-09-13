import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Modal, FlatList, Linking, Animated, ImageBackground } from 'react-native';
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
            id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, category, level, usage_terms, features, created_at
          `)
          .eq('id', id)
          .single();
        
        if (productErr) {
          console.error('❌ Product fetch error:', productErr);
          throw productErr;
        }
        
        // Marka verisini marka profil sayfasındaki gibi çek
        let brandData = null;
        if (product.brand_id) {
          try {
            // Önce brands tablosundan temel veri
            const { data: brand, error: brandErr } = await supabase
              .from('brands')
              .select('id, name, logo_url, category, description, cover_url, website_url, social_instagram, social_twitter, social_facebook, social_linkedin')
              .eq('id', product.brand_id)
              .single();
            
            if (!brandErr && brand) {
            // Sonra brand_profiles tablosundan detay veri
            const { data: profile, error: profileErr } = await supabase
              .from('brand_profiles')
              .select('display_name, category, description, email, website, social_instagram, social_twitter, social_facebook, social_linkedin, avatar_url, cover_url, phone')
              .eq('brand_id', product.brand_id)
              .maybeSingle();
            
            console.log('🔍 Socials debug:', {
              brand_instagram: brand?.social_instagram,
              brand_twitter: brand?.social_twitter,
              brand_facebook: brand?.social_facebook,
              brand_linkedin: brand?.social_linkedin,
              profile_instagram: profile?.social_instagram,
              profile_twitter: profile?.social_twitter,
              profile_facebook: profile?.social_facebook,
              profile_linkedin: profile?.social_linkedin,
              profileError: profileErr
            });
            
              
              // Marka profil sayfasındaki gibi merge et
              const toUrl = (platform: 'instagram'|'facebook'|'linkedin'|'twitter', value?: string | null) => {
                console.log(`🔍 toUrl debug for ${platform}:`, { value, type: typeof value });
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
                const result = `${base[platform]}${h}`;
                console.log(`🔍 toUrl result for ${platform}:`, result);
                return result;
              };
              
              brandData = {
                ...brand,
                name: profile?.display_name || brand.name,
                category: profile?.category || brand.category,
                description: profile?.description || brand.description,
                email: profile?.email || null,
                website_url: brand.website_url || (profile?.website ? (/^https?:\/\//i.test(profile.website) ? profile.website : `https://${profile.website}`) : null),
                socials: {
                  instagram: toUrl('instagram', profile?.social_instagram) || toUrl('instagram', brand.social_instagram) || null,
                  twitter: toUrl('twitter', profile?.social_twitter) || toUrl('twitter', brand.social_twitter) || null,
                  facebook: toUrl('facebook', profile?.social_facebook) || toUrl('facebook', brand.social_facebook) || null,
                  linkedin: toUrl('linkedin', profile?.social_linkedin) || toUrl('linkedin', brand.social_linkedin) || null,
                },
                cover_url: brand.cover_url || profile?.cover_url || null,
                logo_url: profile?.avatar_url || brand.logo_url || null,
                brand_profiles: profile
              };
              
            } else {
              // Fallback: sadece temel marka verisi
              brandData = {
                id: product.brand_id,
                name: 'Bilinmeyen Marka',
                logo_url: null,
                category: '',
                description: '',
                email: null,
                website_url: null,
                socials: {},
                cover_url: null, // Kapak resmi yok
                brand_profiles: null
              };
            }
          } catch (err) {
            console.error('❌ Brand data fetch error:', err);
            // Fallback: sadece temel marka verisi
            brandData = {
              id: product.brand_id,
              name: 'Bilinmeyen Marka',
              logo_url: null,
              category: '',
              description: '',
              email: null,
              website_url: null,
              socials: {},
              cover_url: null, // Kapak resmi yok
              brand_profiles: null
            };
          }
        }
        
        // Ürün görsellerini çek
        const { data: images } = await supabase
          .from('product_images')
          .select('url, is_cover, position')
          .eq('product_id', id)
          .order('position');
        
        // Marketplace linklerini çek (varsa)
        const { data: marketplaces, error: marketplaceErr } = await supabase
          .from('product_marketplaces')
          .select('marketplace, url')
          .eq('product_id', id);
        
        console.log('🔍 Marketplace debug:', {
          marketplaces,
          marketplaceErr,
          productId: id
        });
        
        const productData = {
          ...product,
          brand: brandData,
          product_images: images || [],
          product_marketplaces: marketplaces || [],
          brandId: product.brand_id || brandData?.id, // brand_id yoksa brand?.id kullan
        };
        
        console.log('🔍 Product data debug:', {
          rawFeatures: product.features,
          featuresType: typeof product.features,
          featuresIsArray: Array.isArray(product.features),
          featuresLength: product.features?.length,
          featuresString: typeof product.features === 'string' ? product.features : 'Not a string',
          processedFeatures: productData.features,
          processedFeaturesLength: productData.features?.length
        });
        
        setItem(productData);
      } catch (e: any) {
        console.error('❌ Product detail error:', e?.message || e);
        console.error('❌ Error details:', e);
        setError(`Ürün verisi alınamadı: ${e?.message || 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => controller.abort();
  }, [id]);

  // Mock data removed - using real data from Supabase

  const product = item ? {
    id: item.id,
    name: item.name || item.title,
    brand: item.brand, // Tüm brand objesini kullan
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
    features: (() => {
      console.log('🔍 Raw features data:', item.features, typeof item.features);
      
      // Önce Supabase'den gelen features JSONB'yi kontrol et
      if (item.features && Array.isArray(item.features)) {
        // Array ise, içindeki string'leri temizle
        return item.features.map((f: any) => {
          if (typeof f === 'string') {
            return f.replace(/^['"\(\)\[\]]+|['"\(\)\[\]]+$/g, '').trim();
          }
          return String(f).replace(/^['"\(\)\[\]]+|['"\(\)\[\]]+$/g, '').trim();
        }).filter((f: string) => f.length > 0);
      }
      
      // JSON string ise parse et
      if (typeof item.features === 'string' && item.features.trim()) {
        try {
          const parsed = JSON.parse(item.features);
          if (Array.isArray(parsed)) {
            return parsed.map((f: any) => {
              if (typeof f === 'string') {
                return f.replace(/^['"\(\)\[\]]+|['"\(\)\[\]]+$/g, '').trim();
              }
              return String(f).replace(/^['"\(\)\[\]]+|['"\(\)\[\]]+$/g, '').trim();
            }).filter((f: string) => f.length > 0);
          }
        } catch (e) {
          console.log('🔍 JSON parse failed, trying comma split');
          // JSON parse başarısızsa virgülle ayır
          return item.features
            .split(',')
            .map((f: string) => f.trim())
            .map((f: string) => f.replace(/^['"\(\)\[\]]+|['"\(\)\[\]]+$/g, ''))
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);
        }
      }
      
      // Test verisi ekle
      return [
        "Yüksek kaliteli malzeme",
        "Uzun ömürlü kullanım",
        "Kolay temizlik",
        "Modern tasarım"
      ];
    })(),
    brandInfo: {
      name: item.brand?.name || 'Marka',
      logo: item.brand?.logo_url,
      coverImage: item.brand?.cover_url, // Sadece gerçek kapak resmi
      website: item.brand?.website_url,
      email: item.brand?.email,
      phone: item.brand?.brand_profiles?.phone || item.brand?.phone || '',
      category: item.brand?.category || '',
      description: item.brand?.description || '',
      socials: item.brand?.socials || {}
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
      // Test verisi ekle - gerçek URL'lerden logo çekilecek
      return [
        {
          id: 1,
          name: 'Trendyol',
          logo: '', // OG image API'den çekilecek
          url: 'https://trendyol.com'
        },
        {
          id: 2,
          name: 'Hepsiburada',
          logo: '', // OG image API'den çekilecek
          url: 'https://hepsiburada.com'
        },
        {
          id: 3,
          name: 'Amazon',
          logo: '', // OG image API'den çekilecek
          url: 'https://amazon.com'
        },
        {
          id: 4,
          name: 'GittiGidiyor',
          logo: '', // OG image API'den çekilecek
          url: 'https://gittigidiyor.com'
        },
        {
          id: 5,
          name: 'N11',
          logo: '', // OG image API'den çekilecek
          url: 'https://n11.com'
        }
      ];
    })()
  } : null;

  // Resolve marketplace logos from provided URLs (og:image/twitter:image) if missing
  useEffect(() => {
    const abort = new AbortController();
    const run = async () => {
      try {
        if (!product) return; // Early return if product is null
        const links = (product.marketplaceLinks ?? []).slice(0, 6); // limit a bit
        const base = process.env.EXPO_PUBLIC_ADMIN_API_BASE || 'http://192.168.1.167:3010';
        console.log('🔍 Resolving marketplace logos for:', links.map((l: { id: number | string; name: string; logo: string; url: string }) => l.name));
        
        const resolved = await Promise.all(links.map(async (l: { id: number | string; name: string; logo: string; url: string }) => {
          const fallback = l.logo || product.image || (product.images && product.images[0]) || '';
          if (!l.url) return { ...l, logo: fallback };
          try {
            console.log(`🔍 Fetching logo for ${l.name} from ${l.url}`);
            const res = await fetch(`${base}/api/og-image?url=${encodeURIComponent(l.url)}`, { signal: abort.signal });
            if (!res.ok) {
              console.log(`❌ Failed to fetch logo for ${l.name}:`, res.status);
              return { ...l, logo: fallback };
            }
            const j = await res.json();
            const found = (j?.image as string) || '';
            console.log(`✅ Logo found for ${l.name}:`, found);
            return { ...l, logo: found || fallback };
          } catch (error) {
            console.log(`❌ Error fetching logo for ${l.name}:`, error);
            return { ...l, logo: fallback };
          }
        }));
        console.log('🔍 Resolved marketplace logos:', resolved);
        setResolvedMarketplace(resolved);
      } catch (error) {
        console.log('❌ Error in marketplace logo resolution:', error);
      }
    };
    run();
    return () => abort.abort();
  }, [product?.id]);

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
    if (!product) return; // Null check eklendi
    
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
  const requiredLevel = product?.level || 1;
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
                        {/* Brand Card - Marka profil sayfasındaki kartın aynısı */}
                <View style={styles.profileHeaderWrap}>
                  {product.brandInfo.coverImage ? (
                    <ImageBackground 
                      source={{ uri: product.brandInfo.coverImage }} 
                      style={styles.headerBg} 
                      imageStyle={styles.headerBgImg}
                    >
                      <View style={styles.headerOverlayBg} />
                      <View style={styles.headerContentRow}>
                        <Pressable 
                          style={styles.avatarBigWrap}
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
                          <View style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }}>
                            {!!product.brandInfo.logo && (
                              <Image source={{ uri: product.brandInfo.logo }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                            )}
                          </View>
                        </Pressable>
                        <View style={{ marginLeft: 12, maxWidth: '75%' }}>
                          <Pressable 
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
                            <Text style={[styles.fullnameText, { color: '#ffffff' }]} numberOfLines={1}>{product.brandInfo.name}</Text>
                            {!!product.brandInfo.website && (
                              <Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>
                                {product.brandInfo.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                              </Text>
                            )}
                            {!!product.brandInfo.email && (<Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>{product.brandInfo.email}</Text>)}
                          </Pressable>
                        </View>
                      </View>
                    </ImageBackground>
                  ) : (
                    <LinearGradient
                      colors={['#6366f1', '#8b5cf6', '#a855f7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.headerBg}
                    >
                      <View style={styles.headerOverlayBg} />
                      <View style={styles.headerContentRow}>
                        <Pressable 
                          style={styles.avatarBigWrap}
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
                          <View style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }}>
                            {!!product.brandInfo.logo && (
                              <Image source={{ uri: product.brandInfo.logo }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                            )}
                          </View>
                        </Pressable>
                        <View style={{ marginLeft: 12, maxWidth: '75%' }}>
                          <Pressable 
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
                            <Text style={[styles.fullnameText, { color: '#ffffff' }]} numberOfLines={1}>{product.brandInfo.name}</Text>
                            {!!product.brandInfo.website && (
                              <Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>
                                {product.brandInfo.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                              </Text>
                            )}
                            {!!product.brandInfo.email && (<Text style={[styles.bioShort, { color: '#e2e8f0' }]} numberOfLines={1}>{product.brandInfo.email}</Text>)}
                          </Pressable>
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                </View>

                {/* Web & Sosyal Satırı - Marka profil sayfasındaki gibi */}
                <View style={styles.infoRowWrap}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {!!product.brandInfo.website && (
                      <Pressable 
                        style={styles.infoChip} 
                        onPress={() => Linking.openURL(product.brandInfo.website.startsWith('http') ? product.brandInfo.website : `https://${product.brandInfo.website}`)}
                      >
                        <Ionicons name="globe-outline" size={14} color="#0f172a" />
                        <Text style={styles.infoChipText} numberOfLines={1} ellipsizeMode="tail">{product.brandInfo.website}</Text>
                      </Pressable>
                    )}
                    <View style={styles.socialIcons}>
                      {!!product.brandInfo.socials?.instagram && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.instagram)}>
                          <Ionicons name="logo-instagram" size={18} color="#0f172a" />
                        </Pressable>
                      )}
                      {!!product.brandInfo.socials?.facebook && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.facebook)}>
                          <Ionicons name="logo-facebook" size={18} color="#0f172a" />
                        </Pressable>
                      )}
                      {!!product.brandInfo.socials?.linkedin && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.linkedin)}>
                          <Ionicons name="logo-linkedin" size={18} color="#0f172a" />
                        </Pressable>
                      )}
                      {!!product.brandInfo.socials?.twitter && (
                        <Pressable onPress={() => Linking.openURL(product.brandInfo.socials.twitter)}>
                          <Ionicons name="logo-twitter" size={18} color="#0f172a" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {(product.brandInfo.description && product.brandInfo.description.trim()) && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: '#334155', fontSize: 13 }}>{product.brandInfo.description}</Text>
                    </View>
                  )}
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
                  source={{ 
                    uri: marketplace.logo || product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/100x80/6366f1/ffffff?text=' + encodeURIComponent(marketplace.name)
                  }}
                  style={styles.marketplaceImage}
                  onError={(error) => {
                    console.log('Image load error:', error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully');
                  }}
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
            {console.log('🔍 Features render debug:', {
              features: product.features,
              featuresLength: product.features?.length,
              featuresType: typeof product.features
            })}
            {product.features && product.features.length > 0 ? (
              product.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.featureText}>Özellik bilgisi bulunamadı</Text>
            )}
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
  // Brand Card - Marka profil sayfasındaki gibi
  profileHeaderWrap: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 0 
  },
  headerBg: { 
    width: '100%', 
    height: 160, 
    justifyContent: 'flex-end', 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  headerBgImg: { 
    resizeMode: 'cover', 
    borderRadius: 16 
  },
  headerOverlayBg: { 
    position: 'absolute', 
    inset: 0, 
    backgroundColor: 'rgba(0,0,0,0.35)' 
  },
  headerContentRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingBottom: 12 
  },
  avatarBigWrap: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    overflow: 'hidden', 
    borderWidth: 3, 
    borderColor: '#ffffff' 
  },
  fullnameText: { 
    color: '#0f172a', 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  bioShort: { 
    color: '#334155', 
    fontSize: 12 
  },
  infoRowWrap: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  infoChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12, 
    backgroundColor: '#f1f5f9', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  infoChipText: { 
    color: '#0f172a', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  socialIcons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  brandInfoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
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
  brandCategory: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
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
  brandDescription: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandEmail: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandPhone: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    textDecorationLine: 'underline',
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
  contactInfo: {
    flex: 1,
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
  socialIconsRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  socialIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    height: 80,
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
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketplaceName: {
    color: '#fff',
    fontSize: 11,
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
