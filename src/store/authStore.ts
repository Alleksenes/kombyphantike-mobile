// ── Auth Store (The Gatekeeper) ──────────────────────────────────────────────
// Zustand store for authentication state.
// Hydration Lock: isLoading stays true until session restore completes.
// Tier Sync: after Supabase auth, fetches UserProfile from Postgres via ApiService.

import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { ApiService } from '../services/ApiService';
import { UserProfile, UserTier } from '../types';

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  tier: UserTier | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  /** Restore session from secure storage on app launch. */
  restoreSession: () => Promise<void>;
  /** Sign in with email/password. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign out and clear state. */
  signOut: () => Promise<void>;
  /** Sync user profile and tier from backend. */
  syncProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  tier: null,
  isLoading: true, // Hydration Lock: true until restoreSession completes
  isAuthenticated: false,

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        set({ session: null, user: null, tier: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({ session: data.session, isAuthenticated: true });

      // Tier Sync: fetch UserProfile from Postgres
      try {
        const profile = await ApiService.getMe();
        set({ user: profile, tier: profile.tier, isLoading: false });
      } catch {
        // Auth succeeded but profile fetch failed — still authenticated
        set({ isLoading: false });
      }
    } catch {
      set({ session: null, user: null, tier: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    set({ session: data.session, isAuthenticated: true });

    // Tier Sync
    try {
      const profile = await ApiService.getMe();
      set({ user: profile, tier: profile.tier, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, tier: null, isAuthenticated: false, isLoading: false });
  },

  syncProfile: async () => {
    try {
      const profile = await ApiService.getMe();
      set({ user: profile, tier: profile.tier });
    } catch {
      // Silent — caller can retry
    }
  },
}));
