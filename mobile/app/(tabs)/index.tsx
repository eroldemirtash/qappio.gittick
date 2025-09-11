import { View, Text, FlatList, RefreshControl, Modal, Pressable, StyleSheet, Image } from 'react-native';
import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigation } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import FeedCard from '@/src/features/missions/components/FeedCard';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/src/utils/fonts';

export default function FeedScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Qappio' });
  }, [navigation]);

  const fetchPosts = async () => {
    try {
      // Mock data for now since Supabase tables don't exist
      const mockPosts = [
        {
          id: '1',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop',
          caption: 'Yeni koleksiyonumuzu keşfedin! 🎉 #fashion #style',
          like_count: 42,
          comment_count: 8,
          created_at: new Date().toISOString(),
          is_sponsored: false,
          sponsor_brand: null,
          user: {
            id: 'user-1',
            display_name: 'Nike',
            avatar_url: 'https://via.placeholder.com/40',
            level_name: 'Snapper',
            level_tier: 1
          },
          mission: {
            id: '1',
            title: 'Instagram\'da Paylaş',
            brand: {
              id: 'brand-1',
              name: 'Nike',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Kullanıcı',
            text: 'Harika bir görev!'
          }
        },
        {
          id: '2',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop',
          caption: 'Spor yapmak hiç bu kadar eğlenceli olmamıştı! 💪 #fitness #motivation',
          like_count: 89,
          comment_count: 15,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_sponsored: true,
          sponsor_brand: {
            id: 'sponsor-2',
            name: 'Adidas',
            logo_url: 'https://via.placeholder.com/30'
          },
          user: {
            id: 'user-2',
            display_name: 'Adidas',
            avatar_url: 'https://via.placeholder.com/40',
            level_name: 'Snapper',
            level_tier: 1
          },
          mission: {
            id: '2',
            title: 'TikTok Video Çek',
            brand: {
              id: 'brand-2',
              name: 'Adidas',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Kullanıcı',
            text: 'Harika bir görev!'
          }
        },
        {
          id: '3',
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop',
          caption: 'Doğanın güzelliğini yakaladım 📸 #nature #photography',
          like_count: 156,
          comment_count: 23,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_sponsored: false,
          sponsor_brand: null,
          user: {
            id: 'user-3',
            display_name: 'Puma',
            avatar_url: 'https://via.placeholder.com/40',
            level_name: 'Snapper',
            level_tier: 1
          },
          mission: {
            id: '3',
            title: 'Facebook\'ta Beğen',
            brand: {
              id: 'brand-3',
              name: 'Puma',
              logo_url: 'https://via.placeholder.com/50'
            }
          },
          latest_comment: {
            username: 'Kullanıcı',
            text: 'Harika bir görev!'
          }
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const onLike = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('posts_like', { post_id: postId });
      if (error) throw error;
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: post.like_count + 1 }
          : post
      ));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const onComment = async (postId: string, text: string) => {
    try {
      const { error } = await supabase.rpc('posts_comment', { post_id: postId, text });
      if (error) throw error;
      // Refresh posts to get updated comment count
      fetchPosts();
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const onShare = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('posts_share', { post_id: postId });
      if (error) throw error;
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleMoreOptions = (post: any) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, like_count: (post.like_count || 0) + 1, is_liked: !post.is_liked }
          : post
      )
    );
    console.log('Liked post:', postId);
  };

  const handleComment = (postId: string, text: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comment_count: (post.comment_count || 0) + 1 }
          : post
      )
    );
    console.log('Commented on post:', postId, 'Text:', text);
  };

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId);
  };

  const handleReport = () => {
    console.log('Report post:', selectedPost?.id);
    setModalVisible(false);
  };

  const handleBlock = () => {
    console.log('Block user:', selectedPost?.user?.id);
    setModalVisible(false);
  };



  const renderGridItem = ({ item }: { item: any }) => (
    <Pressable 
      style={styles.gridItem}
      onPress={() => {
        // Switch to list view and show selected post
        setViewMode('list');
        setSelectedPost(item);
        // Scroll to the selected post
        setTimeout(() => {
          const index = posts.findIndex(post => post.id === item.id);
          if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ 
              index, 
              animated: true,
              viewPosition: 0.5 // Center the item
            });
          }
        }, 200); // Increased timeout to ensure list is rendered
      }}
    >
      <FeedCard 
        post={item} 
        onLike={handleLike} 
        onComment={handleComment} 
        onShare={handleShare} 
        isGridView={true}
      />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with filters and view mode */}
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Pressable 
            style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
              Tümü
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.filterButton, selectedFilter === 'following' && styles.activeFilter]}
            onPress={() => setSelectedFilter('following')}
          >
            <Text style={[styles.filterText, selectedFilter === 'following' && styles.activeFilterText]}>
              Takip Ettiklerim
            </Text>
          </Pressable>
        </View>
        
        <Pressable 
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        >
          <Ionicons 
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
            size={24} 
            color="#6b7280" 
          />
        </Pressable>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          ref={flatListRef}
          key="list"
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FeedCard 
              post={item} 
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onMoreOptions={handleMoreOptions}
              isSelected={selectedPost?.id === item.id}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Henüz gönderi yok. İlk gönderiyi sen yap!
              </Text>
            </View>
          }
          onScrollToIndexFailed={(info) => {
            // Fallback if scrollToIndex fails
            console.log('Scroll to index failed:', info);
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ 
                  offset: info.averageItemLength * info.index, 
                  animated: true 
                });
              }
            }, 100);
          }}
        />
      ) : (
        <FlatList
          key="grid"
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Henüz gönderi yok. İlk gönderiyi sen yap!
              </Text>
            </View>
          }
        />
      )}
      
      {/* Options Modal */}
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
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            
            <View style={styles.modalOptions}>
              <Pressable style={styles.modalOption} onPress={handleReport}>
                <Ionicons name="flag-outline" size={24} color="#ef4444" />
                <Text style={styles.modalOptionText}>Şikayet Et</Text>
              </Pressable>
              
              <Pressable style={styles.modalOption} onPress={handleBlock}>
                <Ionicons name="ban-outline" size={24} color="#ef4444" />
                <Text style={styles.modalOptionText}>Engelle</Text>
              </Pressable>
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#374151',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  viewModeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 16,
  },
  // Grid styles
  gridContainer: {
    padding: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 8,
  },
  gridBrandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  gridBrandName: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
  },
  gridUserInfo: {
    alignItems: 'flex-end',
  },
  gridUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 18,
    fontFamily: fonts.comfortaa.bold,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalOptions: {
    gap: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  modalOptionText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

