import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  return (
    <>
            <StatusBar style="light" hidden={true} />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00bcd4',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' },
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Akış', 
          tabBarLabel: 'Akış',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="newspaper-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="market" 
        options={{ 
          title: 'Market', 
          tabBarLabel: 'Market',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="bag-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="qappiolar" 
        options={{ 
          title: 'Qappios', 
          tabBarLabel: 'Qappiolar',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="sparkles-outline" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Cüzdan', 
          tabBarLabel: 'Cuzdan',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="wallet" color={color} size={size}/>
          )
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profil', 
          tabBarLabel: 'Profil',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="person-outline" color={color} size={size}/>
          )
        }}
      />
    </Tabs>
    </>
  );
}
