import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = (Constants.expoConfig?.extra ?? {}) as {
  SUPABASE_URL: string; SUPABASE_ANON_KEY: string;
};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('ENV MISSING:', { url: SUPABASE_URL, keyLen: SUPABASE_ANON_KEY?.length });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
