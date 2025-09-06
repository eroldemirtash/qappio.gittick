import { View, Text } from 'react-native';

export default function MessagesScreen() {
  return (
    <View className="flex-1 bg-bg justify-center items-center">
      <Text className="text-text text-xl font-semibold mb-2">Mesajlar</Text>
      <Text className="text-sub text-center">
        Yakında mesajlaşma özelliği gelecek!
      </Text>
    </View>
  );
}
