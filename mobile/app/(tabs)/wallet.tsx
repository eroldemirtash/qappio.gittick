import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { useNavigation } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Cüzdan' });
  }, [navigation]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      // No authenticated user → stop loading and show empty state
      setBalance(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setError(null);
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
      setError('Cüzdan verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = useMemo(() => {
    // Placeholder level calculation; integrate real level when available
    const lifetime = balance?.lifetimeEarnedQP ?? 0;
    const thresholds = [0, 100, 500, 1500, 4000, 8000]; // 1..5
    let level = 1;
    for (let i = thresholds.length - 1; i >= 1; i--) {
      if (lifetime >= thresholds[i]) { level = i; break; }
    }
    const currentBase = thresholds[level] ?? 0;
    const nextBase = thresholds[level + 1] ?? thresholds[thresholds.length - 1];
    const progressNumer = Math.max(0, Math.min(lifetime - currentBase, nextBase - currentBase));
    const progressDenom = Math.max(1, nextBase - currentBase);
    const progress = progressNumer / progressDenom;
    const names: { [key: number]: string } = { 1: 'Snapper', 2: 'Seeker', 3: 'Crafter', 4: 'Viralist', 5: 'Qappian' };
    const colors: { [key: number]: string[] } = {
      1: ['#fbbf24', '#f59e0b'],
      2: ['#10b981', '#059669'],
      3: ['#8b5cf6', '#6d28d9'],
      4: ['#ef4444', '#b91c1c'],
      5: ['#1e40af', '#1e3a8a'],
    };
    const remainingToNext = Math.max(0, nextBase - lifetime);
    return { level, name: names[level] || 'Snapper', progress, gradient: colors[level] || colors[1], thresholds, lifetime, remainingToNext, nextName: names[Math.min(level + 1, 5)] };
  }, [balance?.lifetimeEarnedQP]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#00bcd4" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <LinearGradient colors={[levelInfo.gradient[0], levelInfo.gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Cüzdan</Text>
            <Text style={styles.headerSubtitle}>Toplam Kazanç</Text>
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="trophy-outline" size={16} color="#fff" />
            <Text style={styles.levelBadgeText}>{levelInfo.name}</Text>
          </View>
        </View>
        <Text style={styles.balanceText}>{balance?.lifetimeEarnedQP ?? 0} QP</Text>
        <View style={styles.spendableRow}>
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.spendableText}>Harcanabilir: {balance?.spendableQP ?? 0} QP</Text>
        </View>
        {/* Progress */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(levelInfo.progress * 100)}%`, backgroundColor: levelInfo.gradient[1] }]} />
        </View>
        <Text style={styles.progressHint}>Sonraki seviyeye ilerleme: {Math.round(levelInfo.progress * 100)}%</Text>
      </LinearGradient>

      {/* Level Journey Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeaderRow}>
          <View>
            <Text style={styles.levelTitle}>Seviye Yolculuğu</Text>
            <Text style={styles.levelSubtitle}>Şu an: {levelInfo.name}</Text>
          </View>
          <View style={styles.nextBadge}>
            <Ionicons name="chevron-forward" size={14} color="#111827" />
            <Text style={styles.nextBadgeText}>{levelInfo.nextName}</Text>
          </View>
        </View>

        {/* Segmented Level Bar */}
        <View style={styles.segmentBar}>
          {[1,2,3,4,5].map((seg) => {
            const isPast = seg < levelInfo.level;
            const isCurrent = seg === levelInfo.level;
            const isNext = seg === levelInfo.level + 1;
            const filledBg = { backgroundColor: levelInfo.gradient[0] };
            const partialBg = { backgroundColor: levelInfo.gradient[1] };
            return (
              <View key={seg} style={styles.segmentWrap}>
                <View style={[styles.segmentTrack, (isPast || isCurrent) && filledBg]}>
                  {isNext ? (
                    <View style={[styles.segmentFillPartial, partialBg, { width: `${Math.round(levelInfo.progress * 100)}%` }]} />
                  ) : null}
                </View>
                <Text style={styles.segmentLabel}>{levelInfo.thresholds[seg]} QP</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.levelFooterRow}>
          <Text style={styles.levelHint}>
            Sonraki seviyeye kalan: {levelInfo.remainingToNext} QP
          </Text>
          <Text style={styles.levelTotal}>Toplam: {levelInfo.lifetime} QP</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate('market/index' as never)}>
          <LinearGradient colors={["#00bcd4", "#0097a7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickActionGrad}>
            <Ionicons name="bag-outline" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Market</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={fetchWalletData}>
          <LinearGradient colors={["#10b981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickActionGrad}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Yenile</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate('profile' as never)}>
          <LinearGradient colors={["#6366f1", "#4338ca"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickActionGrad}>
            <Ionicons name="person-outline" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Profil</Text>
        </Pressable>
      </View>

      {/* Error State */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Transactions */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>
        <Text style={styles.sectionHint}>Son 20</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.txnList}
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.txnItem}>
            <View style={styles.txnLeft}>
              <View style={[styles.txnIconWrap, item.amount > 0 ? styles.txnEarn : styles.txnSpend]}>
                <Ionicons name={item.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'} size={18} color="#fff" />
              </View>
              <View style={styles.txnTexts}>
                <Text style={styles.txnTitle} numberOfLines={1}>{item.description || (item.amount > 0 ? 'Kazanç' : 'Harcama')}</Text>
                <Text style={styles.txnSub}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
              </View>
            </View>
            <Text style={[styles.txnAmount, item.amount > 0 ? styles.amountEarn : styles.amountSpend]}>
              {item.amount > 0 ? '+' : ''}{item.amount} QP
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Henüz işlem geçmişi yok</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centerContainer: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { color: '#374151', fontSize: 14 },

  headerCard: { margin: 16, borderRadius: 20, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleWrap: {},
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  levelBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  balanceText: { color: '#ffffff', fontSize: 32, fontWeight: '800', marginTop: 12 },
  spendableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  spendableText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  progressTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)' },
  progressHint: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6 },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 8 },
  quickAction: { alignItems: 'center', gap: 6, flex: 1 },
  quickActionGrad: { width: '100%', paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionText: { color: '#111827', fontSize: 12, fontWeight: '600', marginTop: 6 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, padding: 12, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', marginTop: 8 },
  errorText: { color: '#b91c1c', fontSize: 13, fontWeight: '600' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: '700' },
  sectionHint: { color: '#9ca3af', fontSize: 12 },
  txnList: { paddingHorizontal: 16, paddingBottom: 16 },
  txnItem: { backgroundColor: '#ffffff', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  txnIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  txnEarn: { backgroundColor: '#10b981' },
  txnSpend: { backgroundColor: '#ef4444' },
  txnTexts: { flex: 1 },
  txnTitle: { color: '#111827', fontSize: 14, fontWeight: '600' },
  txnSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  amountEarn: { color: '#10b981' },
  amountSpend: { color: '#ef4444' },
  // Level card styles
  levelCard: { marginHorizontal: 16, marginBottom: 8, padding: 16, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  levelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelTitle: { color: '#111827', fontSize: 16, fontWeight: '700' },
  levelSubtitle: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  nextBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  nextBadgeText: { color: '#111827', fontSize: 12, fontWeight: '700' },
  segmentBar: { flexDirection: 'row', gap: 8, marginTop: 12 },
  segmentWrap: { flex: 1, alignItems: 'center' },
  segmentTrack: { width: '100%', height: 10, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' },
  segmentFillFull: { backgroundColor: '#d1fae5' },
  segmentFillPartial: { height: '100%' },
  segmentLabel: { color: '#6b7280', fontSize: 10, marginTop: 4, fontWeight: '600' },
  levelFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  levelHint: { color: '#374151', fontSize: 12 },
  levelTotal: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  // Empty list
  emptyBox: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});
