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
  isGuest: boolean;

  /** Restore session from secure storage on app launch. */
  restoreSession: () => Promise<void>;
  /** Sign in with email/password. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign in with Google OAuth. */
  signInWithGoogle: () => Promise<void>;
  /** Continue as guest (Initiate tier, no session). */
  continueAsGuest: () => void;
  /** Instantly authenticate as Scholar. No-op in production. */
  devBypass: () => void;
  /** Sign out and clear state. */
  signOut: () => Promise<void>;
  /** Sync user profile and tier from backend. */
  syncProfile: () => Promise<void>;
}

const isDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: isDevMode ? { id: 'dev-scholar', email: 'scholar@kombyphantike.dev', tier: 'scholar' } : null,
  tier: isDevMode ? 'scholar' : null,
  isLoading: false,
  isAuthenticated: isDevMode,
  isGuest: false,

  restoreSession: async () => {
    if (isDevMode) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ session, isAuthenticated: true });
      try {
        const profile = await ApiService.getMe();
        set({ user: profile, tier: profile.tier });
      } catch { /* silent */ }
    }
    set({ isLoading: false });
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

  signInWithGoogle: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    // OAuth redirects — session will be picked up by restoreSession on return
    // For native, the session is handled via deep link callback
    set({ isLoading: false });
  },

  devBypass: () => {
    if (!isDevMode) return;
    set({
      isAuthenticated: true,
      tier: 'scholar',
      user: { id: 'dev-scholar', email: 'scholar@kombyphantike.dev', tier: 'scholar' },
      isGuest: false,
      isLoading: false,
    });
  },

  continueAsGuest: () => {
    set({
      session: null,
      user: null,
      tier: 'initiate',
      isAuthenticated: true,
      isGuest: true,
      isLoading: false,
    });
  },

  signOut: async () => {
    const { isGuest } = get();
    if (!isGuest) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null, tier: null, isAuthenticated: false, isGuest: false, isLoading: false });
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
