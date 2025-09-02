import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#00bcd4',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: { backgroundColor: '#091021', borderTopColor: '#1f2937' },
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Akış', 
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="market" 
        options={{ 
          title: 'Market', 
          tabBarIcon: ({color, size}) => (
            <Ionicons name="bag-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="qappiolar" 
        options={{ 
          title: 'Qappiolar', 
          tabBarIcon: ({color, size}) => (
            <Ionicons name="sparkles-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Cüzdan', 
          tabBarIcon: ({color, size}) => (
            <Ionicons name="wallet" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profil', 
          tabBarIcon: ({color, size}) => (
            <Ionicons name="person-outline" color={color} size={size}/>
          )
        }}
      />
    </Tabs>
  );
}
