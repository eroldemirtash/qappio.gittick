import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/store/useAuth';
import { supabase } from '@/src/lib/supabase';
import { FeedItem } from '@/src/features/missions/types';
import FeedCard from '@/src/features/missions/components/FeedCard';
import { useUI } from '@/src/store/useUI';

export default function FeedScreen() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { showToast } = useUI();

  const fetchFeed = async () => {
    try {
      // TODO: Update field names based on your actual schema
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, media_type, media_url, caption, like_count, comment_count, created_at, is_sponsored,
          user:profiles ( id, display_name, avatar_url, level_name, level_tier ),
          mission:missions ( id, title, brand:brands ( id, name, logo_url ) ),
          sponsor_brand:brands!posts_sponsor_brand_id_fkey ( id, name, logo_url ),
          latest_comment:latest_comments!left ( username, text )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Feed fetch error:', error);
        showToast('Akış yüklenemedi', 'error');
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Feed fetch error:', error);
      showToast('Akış yüklenemedi', 'error');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('posts_like', { post_id: postId });
      if (error) throw error;
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === postId 
          ? { ...item, like_count: (item.like_count || 0) + 1 }
          : item
      ));
    } catch (error) {
      console.error('Like error:', error);
      showToast('Beğeni hatası', 'error');
    }
  };

  const handleComment = (postId: string) => {
    showToast('Yorum özelliği yakında gelecek', 'info');
  };

  const handleShare = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('posts_share', { post_id: postId });
      if (error) throw error;
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text className="text-text mt-4">Akış yükleniyor...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-bg justify-center items-center px-6">
        <Text className="text-2xl font-bold text-text mb-2">Akış Boş</Text>
        <Text className="text-sub text-center mb-6">
          Henüz paylaşım yok. İlk görevi sen tamamla!
        </Text>
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00bcd4"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
