import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
      },
      tabBarIconStyle: {
        marginTop: 4,
      }
    }}>
      {/* 1. Akış */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Qappio', 
          tabBarLabel: 'Akış',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={28} />
        }} 
      />
      {/* 2. Market */}
      <Tabs.Screen 
        name="market/index" 
        options={{ 
          title: 'Market',
          tabBarLabel: 'Market',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" color={color} size={28} />
        }} 
      />
      {/* 3. Qappiolar */}
      <Tabs.Screen 
        name="qappios/index" 
        options={{ 
          title: 'Qappiolar',
          tabBarLabel: 'Qappiolar',
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" color={color} size={28} />
        }} 
      />
      {/* 4. Cüzdan */}
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Cüzdan',
          tabBarLabel: 'Cüzdan',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={28} />
        }} 
      />
      {/* 5. Profil */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={28} />
        }} 
      />
    </Tabs>
  );
}