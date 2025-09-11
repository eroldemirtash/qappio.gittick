import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, Pressable, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { card3DStyles } from '@/src/theme/card3D';
import { useNavigation } from 'expo-router';
import FeedCard from '@/src/features/missions/components/FeedCard';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    // Navigation header title
    // Works with custom AppHeader via props.options.headerTitle
    navigation.setOptions({ title: 'Qappio', headerTitleAlign: 'center' });
  }, [navigation]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'following'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedGridPost, setSelectedGridPost] = useState<any>(null);

  // Mock data
  const posts = [
    { 
      id: '1', 
      user: 'kullanici1', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      level: 'Seeker',
      mission: 'TechBrand Kulaklık',
      brand: 'TechBrand',
      brandLogo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center',
      likes: 24,
      comments: 5,
      timeAgo: '2 saat önce'
    },
    { 
      id: '2', 
      user: 'kullanici2', 
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      level: 'Explorer',
      mission: 'Fashion Brand T-shirt',
      brand: 'FashionBrand',
      brandLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      likes: 18,
      comments: 3,
      timeAgo: '4 saat önce'
    },
    { 
      id: '3', 
      user: 'kullanici3', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      level: 'Master',
      mission: 'Food Brand Pizza',
      brand: 'FoodBrand',
      brandLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
      likes: 32,
      comments: 8,
      timeAgo: '6 saat önce'
    },
    { 
      id: '4', 
      user: 'kullanici4', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      level: 'Seeker',
      mission: 'Beauty Brand Lipstick',
      brand: 'BeautyBrand',
      brandLogo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
      likes: 15,
      comments: 2,
      timeAgo: '8 saat önce'
    },
    { 
      id: '5', 
      user: 'kullanici5', 
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      level: 'Explorer',
      mission: 'Sport Brand Shoes',
      brand: 'SportBrand',
      brandLogo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      likes: 28,
      comments: 6,
      timeAgo: '1 gün önce'
    },
    { 
      id: '6', 
      user: 'kullanici6', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      level: 'Master',
      mission: 'Book Brand Novel',
      brand: 'BookBrand',
      brandLogo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=50&h=50&fit=crop&crop=center',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
      likes: 12,
      comments: 1,
      timeAgo: '2 gün önce'
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Seeker': return '#3b82f6';
      case 'Explorer': return '#10b981';
      case 'Master': return '#f59e0b';
      case 'Legend': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const handleMoreOptions = (post: any) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleReport = () => {
    console.log('Report post:', selectedPost?.id);
    setModalVisible(false);
  };

  const handleBlock = () => {
    console.log('Block user:', selectedPost?.user);
    setModalVisible(false);
  };

  const renderGridPost = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <Pressable style={styles.gridCard} onPress={() => {
        setSelectedGridPost(item);
        setViewMode('list');
      }}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        
        {/* User Info Overlay - Bottom Left */}
        <View style={styles.gridUserOverlay}>
          <View style={[styles.gridAvatarContainer, { borderColor: getLevelColor(item.level) }]}>
            <Image source={{ uri: item.avatar }} style={styles.gridAvatar} />
          </View>
        </View>

        {/* Brand Info Overlay */}
        <View style={styles.gridBrandOverlay}>
          <View style={styles.gridBrandInfo}>
            <Image source={{ uri: item.brandLogo }} style={styles.gridBrandLogo} />
            <Text style={styles.gridBrandName}>{item.brand}</Text>
          </View>
        </View>

        {/* Stats Overlay */}
        <View style={styles.gridStatsOverlay}>
          <View style={styles.gridStats}>
            <Ionicons name="heart" size={14} color="#ef4444" />
            <Text style={styles.gridStatsText}>{item.likes}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );

  const renderListPost = ({ item }: { item: any }) => (
    <FeedCard post={item} onMoreOptions={handleMoreOptions} />
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Qappio', headerTitleAlign: 'center' }} />
      <View style={styles.container}>
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {selectedGridPost ? (
          <View style={styles.detailHeader}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                setSelectedGridPost(null);
                setViewMode('grid');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </Pressable>
            <Text style={styles.detailTitle}>Gönderi Detayı</Text>
            <View style={styles.placeholder} />
          </View>
        ) : (
          <>
            <View style={styles.filterTabs}>
              <Pressable
                style={[styles.filterTab, filterMode === 'all' && styles.filterTabActive]}
                onPress={() => setFilterMode('all')}
              >
                <Text style={[styles.filterTabText, filterMode === 'all' && styles.filterTabTextActive]}>
                  Tümü
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterTab, filterMode === 'following' && styles.filterTabActive]}
                onPress={() => setFilterMode('following')}
              >
                <Text style={[styles.filterTabText, filterMode === 'following' && styles.filterTabTextActive]}>
                  Takip Ettiklerim
                </Text>
              </Pressable>
            </View>
            
            <Pressable
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={20} 
                color="#1e293b" 
              />
            </Pressable>
          </>
        )}
      </View>

      <FlatList
        data={selectedGridPost ? [selectedGridPost] : posts}
        renderItem={viewMode === 'grid' ? renderGridPost : renderListPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={viewMode === 'grid' ? 3 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}
      />



      {/* More Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seçenekler</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1e293b" />
              </Pressable>
            </View>
            
            <View style={styles.modalOptions}>
              <Pressable style={styles.modalOption} onPress={handleReport}>
                <Ionicons name="flag-outline" size={20} color="#ef4444" />
                <Text style={styles.modalOptionText}>Şikayet Et</Text>
              </Pressable>
              
              <Pressable style={styles.modalOption} onPress={handleBlock}>
                <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
                <Text style={styles.modalOptionText}>Engelle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </>
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    padding: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 32,
  },
  // Grid Styles
  gridContainer: {
    padding: 8,
  },
  gridItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
  },
  gridCard: {
    flex: 1,
    overflow: 'hidden',
    ...card3DStyles.card3D,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridUserOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  gridUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 6,
  },
  gridAvatar: {
    width: '100%',
    height: '100%',
  },
  gridUserDetails: {
    flex: 1,
  },
  gridUsername: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gridLevelCard: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  gridLevelText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '600',
  },
  gridBrandOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  gridBrandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  gridBrandName: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  gridStatsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  gridStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridStatsText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  // List Styles
  listContainer: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalOptionText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});