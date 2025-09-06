import { View, Text } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-bg justify-center items-center">
      <Text className="text-text text-xl font-semibold mb-2">Bildirimler</Text>
      <Text className="text-sub text-center">
        Henüz bildirim yok
      </Text>
    </View>
  );
}
