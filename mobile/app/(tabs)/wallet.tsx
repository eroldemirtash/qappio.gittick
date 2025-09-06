import { View, Text, FlatList } from 'react-native';
import { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/useAuth';

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Cüzdan' });
  }, [navigation]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (balanceError) throw balanceError;
      setBalance(balanceData);

      // Fetch transactions
      const { data: txnsData, error: txnsError } = await supabase
        .from('wallet_txns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txnsError) throw txnsError;
      setTransactions(txnsData || []);
    } catch (error) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <Text className="text-text">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      {/* Balance Card */}
      <View className="bg-card m-4 p-6 rounded-xl border border-border">
        <Text className="text-sub text-sm mb-2">Toplam Kazanç</Text>
        <Text className="text-text text-3xl font-bold mb-1">
          {balance?.lifetimeEarnedQP || 0} QP
        </Text>
        <Text className="text-sub text-sm">
          Harcanabilir: {balance?.spendableQP || 0} QP
        </Text>
      </View>

      {/* Transactions */}
      <View className="px-4">
        <Text className="text-text font-semibold text-lg mb-3">İşlem Geçmişi</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-card p-4 rounded-lg mb-2 border border-border">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-text font-medium">{item.description}</Text>
                  <Text className="text-sub text-sm">
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <Text className={`font-bold ${
                  item.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.amount > 0 ? '+' : ''}{item.amount} QP
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="py-8">
              <Text className="text-sub text-center">
                Henüz işlem geçmişi yok
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
