import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  level_name?: string;
  level_tier?: number;
  city?: string;
  push_token?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setPushToken: (token: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user, session });
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ profile });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

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

  verifyOtp: async (email: string, token: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      
      if (error) throw error;
      
      if (data.user) {
        set({ user: data.user, session: data.session });
        
        // Create or update profile
        const { data: profile } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            display_name: data.user.email?.split('@')[0] || 'User',
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        set({ profile });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) return;
    
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
    }
  },

  setPushToken: async (token: string) => {
    const { user } = get();
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', user.id);
      
      set(state => ({
        profile: state.profile ? { ...state.profile, push_token: token } : null
      }));
    } catch (error) {
      console.error('Push token update error:', error);
    }
  },
}));
