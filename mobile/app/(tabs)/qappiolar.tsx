import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QappiolarScreen() {
  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="sparkles-outline" size={64} color="#94a3b8" />
        <Text className="text-2xl font-bold text-text mt-4 mb-2">Qappiolar</Text>
        <Text className="text-sub text-center">
          Topluluk ve etkinlikler yakında gelecek
        </Text>
      </View>
    </ScrollView>
  );
}
