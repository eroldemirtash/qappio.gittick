import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { card3DStyles } from '@/src/theme/card3D';

export default function MarketScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappio', headerTitleAlign: 'center' });
  }, [navigation]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLevel, setSelectedLevel] = useState<string | null>('Seeker'); // Default to user's level
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all'); // Default to "Tümü"

  // Mock user level - gerçekte Supabase'den gelecek
  const userLevel = 2; // Seeker level
  const userPoints = 150; // User'ın mevcut puanı

  const levels = [
    { id: 1, name: 'Snapper', color: '#fbbf24', points: '0-99', minPoints: 0, maxPoints: 99 },
    { id: 2, name: 'Seeker', color: '#10b981', points: '100-299', minPoints: 100, maxPoints: 299 },
    { id: 3, name: 'Crafter', color: '#8b5cf6', points: '300-599', minPoints: 300, maxPoints: 599 },
    { id: 4, name: 'Viralist', color: '#ef4444', points: '600-999', minPoints: 600, maxPoints: 999 },
    { id: 5, name: 'Qappian', color: '#1e40af', points: '1000+', minPoints: 1000, maxPoints: 9999 },
  ];

  const categories = [
    { id: 'all', name: 'Tümü', icon: 'grid-outline' },
    { id: 'elektronik', name: 'Elektronik', icon: 'phone-portrait-outline' },
    { id: 'spor', name: 'Spor', icon: 'fitness-outline' },
    { id: 'ev', name: 'Ev', icon: 'home-outline' },
    { id: 'moda', name: 'Moda', icon: 'shirt-outline' },
    { id: 'kitap', name: 'Kitap', icon: 'book-outline' },
    { id: 'kozmetik', name: 'Kozmetik', icon: 'flower-outline' },
  ];

  const products = [
    // Snapper Level
    { id: '1', name: 'Kablosuz Kulaklık', brand: 'TechBrand', stock: 15, qpValue: 500, level: 'Snapper', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center' },
    { id: '2', name: 'Bluetooth Hoparlör', brand: 'SoundBrand', stock: 12, qpValue: 350, level: 'Snapper', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center' },
    { id: '3', name: 'Telefon Kılıfı', brand: 'CaseBrand', stock: 25, qpValue: 200, level: 'Snapper', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center' },
    { id: '4', name: 'Kitap', brand: 'BookBrand', stock: 30, qpValue: 150, level: 'Snapper', category: 'Kitap', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center' },
    { id: '5', name: 'Powerbank', brand: 'PowerBrand', stock: 20, qpValue: 300, level: 'Snapper', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1609592807905-0b0b4a0b0b0b?w=400&h=400&fit=crop&crop=center' },
    { id: '6', name: 'USB Kablo', brand: 'CableBrand', stock: 35, qpValue: 100, level: 'Snapper', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center' },
    
    // Seeker Level
    { id: '7', name: 'Spor Ayakkabı', brand: 'SportBrand', stock: 8, qpValue: 800, level: 'Seeker', category: 'Spor', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center' },
    { id: '8', name: 'Fitness Bilekliği', brand: 'FitBrand', stock: 10, qpValue: 600, level: 'Seeker', category: 'Spor', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center' },
    { id: '9', name: 'Spor Çantası', brand: 'GymBrand', stock: 6, qpValue: 750, level: 'Seeker', category: 'Spor', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center' },
    { id: '10', name: 'Kozmetik Seti', brand: 'BeautyBrand', stock: 4, qpValue: 900, level: 'Seeker', category: 'Kozmetik', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center' },
    { id: '11', name: 'Yoga Matı', brand: 'YogaBrand', stock: 7, qpValue: 650, level: 'Seeker', category: 'Spor', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center' },
    { id: '12', name: 'Spor Kıyafeti', brand: 'SportWear', stock: 9, qpValue: 700, level: 'Seeker', category: 'Moda', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center' },
    
    // Crafter Level
    { id: '13', name: 'Kahve Makinesi', brand: 'HomeBrand', stock: 3, qpValue: 1200, level: 'Crafter', category: 'Ev', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center' },
    { id: '14', name: 'Blender', brand: 'KitchenBrand', stock: 5, qpValue: 1000, level: 'Crafter', category: 'Ev', image: 'https://images.unsplash.com/photo-1585515656519-2b1b3b3b3b3b?w=400&h=400&fit=crop&crop=center' },
    { id: '15', name: 'Moda Çanta', brand: 'FashionBrand', stock: 7, qpValue: 1100, level: 'Crafter', category: 'Moda', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center' },
    { id: '16', name: 'Tablet', brand: 'TechBrand', stock: 4, qpValue: 1800, level: 'Crafter', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop&crop=center' },
    { id: '17', name: 'Mikrodalga', brand: 'KitchenBrand', stock: 2, qpValue: 1500, level: 'Crafter', category: 'Ev', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&crop=center' },
    { id: '18', name: 'Deri Cüzdan', brand: 'LeatherBrand', stock: 6, qpValue: 1300, level: 'Crafter', category: 'Moda', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center' },
    
    // Viralist Level
    { id: '19', name: 'Akıllı Saat', brand: 'TechBrand', stock: 5, qpValue: 1500, level: 'Viralist', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center' },
    { id: '20', name: 'Gaming Mouse', brand: 'GameBrand', stock: 3, qpValue: 2000, level: 'Viralist', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center' },
    { id: '21', name: 'Premium Kulaklık', brand: 'AudioBrand', stock: 2, qpValue: 2500, level: 'Viralist', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center' },
    { id: '22', name: 'Lüks Parfüm', brand: 'LuxuryBrand', stock: 1, qpValue: 2200, level: 'Viralist', category: 'Kozmetik', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center' },
    { id: '23', name: 'Gaming Klavye', brand: 'GameBrand', stock: 2, qpValue: 1800, level: 'Viralist', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&crop=center' },
    { id: '24', name: 'Lüks Gözlük', brand: 'LuxuryBrand', stock: 1, qpValue: 2800, level: 'Viralist', category: 'Moda', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&crop=center' },
    
    // Qappian Level
    { id: '25', name: 'Laptop', brand: 'TechBrand', stock: 2, qpValue: 3000, level: 'Qappian', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center' },
    { id: '26', name: 'Gaming Laptop', brand: 'GameBrand', stock: 1, qpValue: 5000, level: 'Qappian', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop&crop=center' },
    { id: '27', name: 'Premium Telefon', brand: 'PhoneBrand', stock: 1, qpValue: 4000, level: 'Qappian', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center' },
    { id: '28', name: 'Lüks Saat', brand: 'LuxuryBrand', stock: 1, qpValue: 6000, level: 'Qappian', category: 'Moda', image: 'https://images.unsplash.com/photo-1523170335258-f5c6c6f7f7f7?w=400&h=400&fit=crop&crop=center' },
    { id: '29', name: '4K Monitör', brand: 'DisplayBrand', stock: 1, qpValue: 3500, level: 'Qappian', category: 'Elektronik', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop&crop=center' },
    { id: '30', name: 'Lüks Çanta', brand: 'LuxuryBrand', stock: 1, qpValue: 4500, level: 'Qappian', category: 'Moda', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center' },
  ];

  const filteredProducts = products.filter(product => {
    const levelMatch = !selectedLevel || product.level === selectedLevel;
    const categoryMatch = !selectedCategory || selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const handleProductPress = (productId: string) => {
    router.push(`/market/${productId}`);
  };

  const getLevelColor = (levelName: string) => {
    const level = levels.find(l => l.name === levelName);
    return level?.color || '#10b981';
  };

  const getLevelBarColor = (level: any) => {
    // Kullanıcının mevcut level'ına kadar olan segmentler parlak, sonrakiler soluk
    if (level.id <= userLevel) {
      return level.color;
    } else {
      // Soluk renk için opacity ekle
      return level.color + '40'; // %25 opacity
    }
  };

  const productCardGrid = (product: any) => {
    const productLevel = levels.find(l => l.name === product.level);
    const isHigherLevel = productLevel && productLevel.id > userLevel;
    
    return (
      <Pressable
        key={product.id}
        style={styles.productCardGrid}
        onPress={() => handleProductPress(product.id)}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
        />
        {isHigherLevel && (
          <View style={[styles.levelTag, { backgroundColor: getLevelColor(product.level) }]}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
            <Text style={styles.levelTagText}>{product.level} ol</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.brandContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center' }}
              style={styles.brandLogo}
            />
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>
          <View style={styles.productFooter}>
            <Text style={styles.stockText}>Stok: {product.stock}</Text>
            <View style={styles.qpValueContainer}>
              <LinearGradient
                colors={['#ffd700', '#ffb347', '#ff8c00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qpValueGradient}
              >
                <Text style={styles.qpValueText}>{product.qpValue} QP</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const productCardList = (product: any) => {
    const productLevel = levels.find(l => l.name === product.level);
    const isHigherLevel = productLevel && productLevel.id > userLevel;
    
    return (
      <Pressable
        key={product.id}
        style={styles.productCardList}
        onPress={() => handleProductPress(product.id)}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.productImageList}
        />
        <View style={styles.productInfoList}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.brandContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center' }}
              style={styles.brandLogo}
            />
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>
          <View style={styles.productFooter}>
            <Text style={styles.stockText}>Stok: {product.stock}</Text>
            <View style={styles.qpValueContainer}>
              <LinearGradient
                colors={['#ffd700', '#ffb347', '#ff8c00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qpValueGradient}
              >
                <Text style={styles.qpValueText}>{product.qpValue} QP</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
        {isHigherLevel && (
          <View style={[styles.levelTagList, { backgroundColor: getLevelColor(product.level) }]}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
            <Text style={styles.levelTagText}>{product.level} ol</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Level Bar */}
      <View style={styles.levelBarContainer}>
        <View style={styles.levelBarContent}>
          <View style={styles.levelNames}>
            {levels.map((level) => (
              <Text key={level.id} style={[styles.levelName, { color: level.color }]}>
                {level.name}
              </Text>
            ))}
          </View>
          <View style={styles.levelBar}>
            {levels.map((level, index) => (
              <View
                key={level.id}
                style={[
                  styles.levelSegment,
                  { backgroundColor: getLevelBarColor(level) },
                  index === 0 && styles.firstSegment,
                  index === levels.length - 1 && styles.lastSegment,
                ]}
              />
            ))}
          </View>
          <View style={styles.levelPoints}>
            {levels.map((level) => (
              <Text key={level.id} style={styles.pointText}>
                {level.points}
              </Text>
            ))}
          </View>
        </View>
        
        {/* Grid/List Toggle */}
        <Pressable
          style={[styles.viewToggle, viewMode === 'grid' ? styles.toggleGrid : styles.toggleList]}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          accessibilityLabel="Görünümü değiştir"
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={18} 
            color={viewMode === 'grid' ? '#0ea5b7' : '#1e293b'} 
          />
        </Pressable>
      </View>

      {/* Reyon Buttons - Sticky */}
      <View style={styles.reyonContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reyonScroll}>
          {levels.map((level) => (
            <Pressable
              key={level.id}
              style={[
                styles.reyonButton,
                selectedLevel === level.name && { backgroundColor: level.color }
              ]}
              onPress={() => setSelectedLevel(selectedLevel === level.name ? null : level.name)}
            >
              <Text style={[
                styles.reyonText,
                selectedLevel === level.name && styles.reyonTextActive
              ]}>
                {level.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Categories - Sticky */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? '#fff' : '#94a3b8'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Products - Scrollable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.productsContainer}>
          {viewMode === 'grid' ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map(productCardGrid)}
            </View>
          ) : (
            <View style={styles.productsList}>
              {filteredProducts.map(productCardList)}
            </View>
          )}
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
  scrollContent: {
    flex: 1,
  },
  levelBarContainer: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBarContent: {
    flex: 1,
  },
  levelNames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelBar: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelSegment: {
    flex: 1,
  },
  firstSegment: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  lastSegment: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  levelPoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  toggleGrid: {
    backgroundColor: '#ecfeff',
    borderColor: '#22d3ee',
  },
  toggleList: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  categoryText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryTextActive: {
    color: '#fff',
  },
  reyonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reyonScroll: {
    flexDirection: 'row',
  },
  reyonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 12,
  },
  reyonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  reyonTextActive: {
    color: '#fff',
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardGrid: {
    ...card3DStyles.card3DMarketplace,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  levelTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  productBrand: {
    color: '#94a3b8',
    fontSize: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  qpValueContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  qpValueGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qpValueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  productsList: {
    gap: 12,
  },
  productCardList: {
    ...card3DStyles.card3D,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  productImageList: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfoList: {
    flex: 1,
  },
  levelTagList: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});