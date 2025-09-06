import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions, Modal, FlatList, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Mock product data - gerçekte Supabase'den gelecek
  const product = {
    id: id as string,
    name: 'Kablosuz Kulaklık',
    brand: 'TechBrand',
    stock: 15,
    qpValue: 500,
    level: 'Snapper',
    category: 'Elektronik',
    description: 'Yüksek kaliteli kablosuz kulaklık. Bluetooth 5.0 teknolojisi ile güçlü bağlantı. 20 saat pil ömrü ve hızlı şarj özelliği.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&crop=center',
    ],
    features: [
      'Bluetooth 5.0',
      '20 saat pil ömrü',
      'Hızlı şarj',
      'Su geçirmez',
      'Aktif gürültü engelleme'
    ],
    brandInfo: {
      name: 'TechBrand',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center',
      website: 'www.techbrand.com',
      email: 'info@techbrand.com',
      phone: '0212 555 0123'
    },
    marketplaceLinks: [
      {
        id: 1,
        name: 'Trendyol',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
        url: 'https://trendyol.com/techbrand-kulaklik',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center'
      },
      {
        id: 2,
        name: 'Hepsiburada',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
        url: 'https://hepsiburada.com/techbrand-kulaklik',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center'
      },
      {
        id: 3,
        name: 'Amazon',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
        url: 'https://amazon.com.tr/techbrand-kulaklik',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center'
      },
      {
        id: 4,
        name: 'GittiGidiyor',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
        url: 'https://gittigidiyor.com/techbrand-kulaklik',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center'
      },
      {
        id: 5,
        name: 'N11',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
        url: 'https://n11.com/techbrand-kulaklik',
        logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center'
      }
    ]
  };

  const levelColors: { [key: string]: string } = {
    Snapper: '#fbbf24', // Sarı
    Seeker: '#10b981', // Yeşil
    Crafter: '#8b5cf6', // Mor
    Viralist: '#ef4444', // Kırmızı
    Qappian: '#1e40af', // Lacivert
  };

  const handlePurchase = () => {
    console.log('Purchase product:', product.id);
    setPurchaseModalVisible(true);
    // TODO: Implement actual purchase logic
  };

  // Level kontrolü - gerçekte kullanıcının level'ı Supabase'den gelecek
  const userLevel = 2; // Mock user level
  const levels = [
    { id: 1, name: 'Snapper' },
    { id: 2, name: 'Seeker' },
    { id: 3, name: 'Crafter' },
    { id: 4, name: 'Viralist' },
    { id: 5, name: 'Qappian' },
  ];
  const requiredLevel = levels.find(l => l.name === product.level)?.id || 1;
  const canPurchase = userLevel >= requiredLevel;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Brand Card */}
                <View style={styles.brandCard}>
                  <Image source={{ uri: product.brandInfo.coverImage }} style={styles.brandCoverImage} />
                  <View style={styles.brandOverlay} />
                  
                  {/* Marka Logosu - Sol üst köşe */}
                  <View style={styles.brandLogoContainer}>
                    <Image source={{ uri: product.brandInfo.logo }} style={styles.brandLogo} />
                  </View>
                  
                  {/* Marka Bilgileri - Logonun yanında */}
                  <View style={styles.brandInfo}>
                    <Text style={styles.brandName}>{product.brandInfo.name}</Text>
                    <Text style={styles.brandWebsite}>{product.brandInfo.website}</Text>
                  </View>
                  
                  {/* Mail ve Sosyal Medya - Kartın içinde alt kısım */}
                  <View style={styles.brandContact}>
                    <Text style={styles.contactText}>{product.brandInfo.email}</Text>
                    <View style={styles.socialIcons}>
                      <Ionicons name="logo-twitter" size={20} color="#ffffff" />
                      <Ionicons name="logo-instagram" size={20} color="#ffffff" />
                      <Ionicons name="logo-facebook" size={20} color="#ffffff" />
                    </View>
                  </View>
                </View>

        {/* Marketplace Links */}
        <View style={styles.marketplaceSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketplaceScroll}>
            {product.marketplaceLinks.map((marketplace) => (
              <Pressable
                key={marketplace.id}
                style={styles.marketplaceItem}
                onPress={() => Linking.openURL(marketplace.url)}
              >
                <Image source={{ uri: marketplace.image }} style={styles.marketplaceImage} />
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
            {product.images.map((image, index) => (
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
            {product.images.map((_, index) => (
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
            {product.features.map((feature, index) => (
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
                <Text style={styles.qpValueText}>2500 QP</Text>
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
                <Text style={styles.qpValueText}>{product.qpValue} QP</Text>
              </LinearGradient>
            </View>
          </View>
          
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
              <Text style={[styles.purchaseButtonText, styles.purchaseButtonTextDisabled]}>
                Seviye Yetersiz
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Purchase Success Modal */}
      <Modal
        animationType="slide"
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
                Tebriklerrr 🎉
              </Text>
              <Text style={styles.modalLevelText}>
                {product.level} ürünü artık senin ;)
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
              <Pressable 
                style={styles.modalButtonSecondary}
                onPress={() => setPurchaseModalVisible(false)}
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
              <Pressable 
                style={styles.modalButtonPrimary}
                onPress={() => {
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
              {product.images.map((image, index) => (
                <View key={index} style={styles.modalImageContainer}>
                  <Image source={{ uri: image }} style={styles.modalImage} />
                </View>
              ))}
            </ScrollView>
            
            {/* Dot Indicators */}
            <View style={styles.modalDotContainer}>
              {product.images.map((_, index) => (
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 24,
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
    marginBottom: 20,
  },
  modalCongratsContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  },
  modalButtonGradient: {
    paddingVertical: 12,
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
