import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/store/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialize } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user === null) {
      // User is not authenticated, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user]);

  // Show loading or nothing while checking auth
  if (user === undefined) {
    return null; // or a loading spinner
  }

  // If user is authenticated, show the protected content
  if (user) {
    return <>{children}</>;
  }

  // If user is null (not authenticated), don't render anything
  // The redirect will happen in the useEffect above
  return null;
}
