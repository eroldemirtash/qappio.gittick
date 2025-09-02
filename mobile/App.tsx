import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/src/store/useAuth';
import { useSession } from '@/src/store/useSession';

export default function App() {
  const { user, initialized } = useAuth();
  const { isOnboarded, setReady } = useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user) {
      // Not signed in
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      // Signed in but not onboarded
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/interests');
      }
    } else {
      // Signed in and onboarded
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    }

    setReady(true);
  }, [user, initialized, isOnboarded, segments]);

  return null;
}