import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="paper-plane-outline" size={64} color="#94a3b8" />
        <Text className="text-2xl font-bold text-text mt-4 mb-2">Mesajlar</Text>
        <Text className="text-sub text-center">
          Mesajlaşma özelliği yakında gelecek
        </Text>
      </View>
    </ScrollView>
  );
}
