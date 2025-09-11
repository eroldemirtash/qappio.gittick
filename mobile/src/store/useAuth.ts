import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  initialize: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,

  signIn: async (email: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      console.log('🔄 Starting signup process...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      
      console.log('✅ Auth signup successful:', data.user?.id);
      
      if (data.user) {
        set({ user: data.user });
        console.log('✅ User set in store, profile will be created later');
        
        // Profil oluşturmayı atla, sadece user'ı set et
        // Profil düzenle sayfasında oluşturulacak
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (email: string, token: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      set({ user: data.user });
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates: any) => {
    const { user } = get();
    if (!user) return;
    
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  initialize: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: session.user });
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            set({ profile });
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        set({ user: session.user });
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            set({ profile });
          });
      } else {
        set({ user: null, profile: null });
      }
    });

    // Return cleanup function
    return () => subscription.unsubscribe();
  },
}));
