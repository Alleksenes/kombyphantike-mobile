import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Module-level browser detection — resolved once at import time.
// This is the single source of truth: if there is no window, we are NOT in a browser.
const isBrowser = typeof window !== 'undefined';
const isWeb = Platform.OS === 'web';

// A "No-Op" storage for any non-browser context (SSR, Node, tests)
const noopStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
};

// The Web Storage — only touches localStorage when we are certain we're in a browser
const webStorage = isBrowser
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    }
  : noopStorage;

// The Mobile Storage
const mobileStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Select the correct adapter: web+browser → localStorage, web+no-browser → noop, native → SecureStore
const storageAdapter = isWeb ? webStorage : mobileStorage;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: storageAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);