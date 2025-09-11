import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/store/useAuth';

const INTERESTS = [
  'Teknoloji', 'Spor', 'Müzik', 'Sanat', 'Moda', 'Yemek',
  'Seyahat', 'Oyun', 'Kitap', 'Film', 'Fotoğraf', 'Doğa'
];

export default function InterestsScreen() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();
  const { updateProfile } = useAuth();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) return;
    
    try {
      // Update profile with interests
      await updateProfile({ 
        // interests: selectedInterests // Add this field to your profile schema
      });
      router.push('/(onboarding)/city');
    } catch (error) {
      console.error('Interests update error:', error);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6">
      <View className="pt-16 pb-8">
        <Text className="text-3xl font-bold text-text mb-2">İlgi Alanların</Text>
        <Text className="text-sub text-base">Hangi konularda görev almak istiyorsun?</Text>
      </View>

      <ScrollView className="flex-1 mb-6">
        <View className="flex-row flex-wrap gap-3">
          {INTERESTS.map((interest) => (
            <Pressable
              key={interest}
              className={`px-4 py-3 rounded-xl border ${
                selectedInterests.includes(interest)
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
              onPress={() => toggleInterest(interest)}
            >
              <Text className={`font-semibold ${
                selectedInterests.includes(interest) ? 'text-white' : 'text-text'
              }`}>
                {interest}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        className={`py-4 rounded-xl ${
          selectedInterests.length > 0 ? 'bg-primary' : 'bg-sub'
        }`}
        onPress={handleContinue}
        disabled={selectedInterests.length === 0}
      >
        <Text className="text-center text-white font-semibold text-base">
          Devam Et ({selectedInterests.length})
        </Text>
      </Pressable>
    </View>
  );
}
