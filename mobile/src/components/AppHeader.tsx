import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppHeader(props: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const nav = useNavigation() as any;
  const canGoBack = nav?.canGoBack?.() ?? false;
  const title = props?.options?.headerTitle ?? 'Qappio';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => (canGoBack ? router.back() : null)} style={styles.button}>
          <Ionicons name="chevron-back" size={22} color={canGoBack ? '#e5e7eb' : '#94a3b8'} />
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <View style={styles.rightButtons}>
          <Pressable onPress={() => router.push('/messages')} style={styles.button}>
            <Ionicons name="paper-plane-outline" size={20} color="#e5e7eb" />
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={styles.button}>
            <Ionicons name="notifications-outline" size={20} color="#e5e7eb" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#091021',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
