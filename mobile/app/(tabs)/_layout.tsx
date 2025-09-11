import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// AuthGuard geçici olarak devre dışı

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          height: 68, // bir tık daraltıldı
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#06b6d4', // Qappio turkuaz
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
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
      {/* 3. Qappiolar - Ortada */}
      <Tabs.Screen 
        name="qappiolar" 
        options={{ 
          title: 'Qappiolar',
          tabBarLabel: 'Qappiolar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'star' : 'star-outline'} color={color} size={28} />
          ),
          tabBarItemStyle: { marginHorizontal: 10 },
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