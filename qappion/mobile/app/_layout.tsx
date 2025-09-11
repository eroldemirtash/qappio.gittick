import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import AppHeader from '@/src/components/AppHeader';

export default function Root() {
  return <Stack screenOptions={{ header: (p) => <AppHeader {...p} /> }} />;
}
