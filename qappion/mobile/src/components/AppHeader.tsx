import React from 'react';
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
        <Pressable 
          onPress={() => (canGoBack ? router.back() : null)} 
          style={styles.backButton}
        >
                        <Ionicons
                name="chevron-back"
                size={22}
                color={canGoBack ? '#1e293b' : '#94a3b8'}
              />
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.rightActions}>
          <Pressable 
            onPress={() => router.push('/messages')} 
            style={styles.actionButton}
          >
                          <Ionicons name="paper-plane-outline" size={20} color="#1e293b" />
          </Pressable>
          <Pressable 
            onPress={() => router.push('/notifications')} 
            style={styles.actionButton}
          >
                          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
