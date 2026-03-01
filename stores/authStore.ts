import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ 
          user: profile || null, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        // Auto sign-in anonymously for zero friction
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    set({ isAuthenticated: true, isLoading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
