import { View, Text, Pressable } from 'react-native';
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
    <View style={{ paddingTop: insets.top }} className="bg-[#091021] border-b border-border">
      <View className="h-[52px] flex-row items-center px-2">
        <Pressable 
          onPress={() => (canGoBack ? router.back() : null)} 
          className="p-2 rounded-lg"
        >
          <Ionicons 
            name="chevron-back" 
            size={22} 
            color={canGoBack ? '#e5e7eb' : '#94a3b8'} 
          />
        </Pressable>
        <Text numberOfLines={1} className="flex-1 text-center text-text font-bold text-base">
          {title}
        </Text>
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.push('/messages')} 
            className="p-2 rounded-lg"
          >
            <Ionicons name="paper-plane-outline" size={20} color="#e5e7eb" />
          </Pressable>
          <Pressable 
            onPress={() => router.push('/notifications')} 
            className="p-2 rounded-lg"
          >
            <Ionicons name="notifications-outline" size={20} color="#e5e7eb" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
