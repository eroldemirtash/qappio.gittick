import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function MarketScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Market' });
  }, [navigation]);

  // Mock data - gerçekte Supabase'den gelecek
  const userLevel = 3; // 1-5 arası
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
    { id: 3, name: 'Giyim', icon: 'shirt-outline' },
    { id: 4, name: 'Spor', icon: 'fitness-outline' },
    { id: 5, name: 'Kitap', icon: 'book-outline' },
    { id: 6, name: 'Ev & Yaşam', icon: 'home-outline' },
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
            <View key={level.id} style={styles.levelNameContainer}>
              <Text style={[styles.levelNameText, { color: level.color }]}>{level.name}</Text>
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

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => (
          <Pressable key={category.id} style={styles.categoryButton}>
            <Ionicons name={category.icon as any} size={20} color="#6b7280" />
            <Text style={styles.categoryText}>{category.name}</Text>
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
            <Text style={styles.productBrandGrid}>{product.brand}</Text>
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
              <Text style={styles.stockTextGrid}>Stok: {product.stock}</Text>
              {selectedLevel === product.level && (
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
              <Text style={styles.productBrandList}>{product.brand}</Text>
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
            <Text style={styles.stockTextList}>Stok: {product.stock}</Text>
            {selectedLevel === product.level && (
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

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        {renderLevelBar()}
        {renderReyonButtons()}
        {renderCategories()}
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.productsContainer, viewMode === 'grid' && styles.productsGrid]}>
          {products
            .filter(product => selectedLevel === null || product.level === selectedLevel)
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
  levelNameText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  },
  categoryText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
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
    color: '#9ca3af',
    fontSize: 10,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  qpTextList: {
    color: '#ffffff',
    fontSize: 16,
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
    color: '#9ca3af',
    fontSize: 12,
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
