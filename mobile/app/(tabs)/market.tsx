import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MarketScreen() {
  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="bag-outline" size={64} color="#94a3b8" />
        <Text className="text-2xl font-bold text-text mt-4 mb-2">Market</Text>
        <Text className="text-sub text-center">
          Ödüller ve hediyeler yakında gelecek
        </Text>
      </View>
    </ScrollView>
  );
}
