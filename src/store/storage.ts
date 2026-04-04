// ── RESILIENT STORAGE ADAPTER ────────────────────────────────────────────────
// Wraps AsyncStorage for Zustand persist middleware.
// If the native module is null (common on Android Expo Go when the bridge
// hasn't loaded), all operations silently fall back to an in-memory Map.
// This prevents catastrophic crash loops from bubbling into Zustand's
// rehydration cycle.
//
// Usage:
//   import { resilientStorage } from './storage';
//   persist(..., { storage: resilientStorage })

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

// ── In-Memory Fallback ──────────────────────────────────────────────────────
const memoryStore = new Map<string, string>();
let usingFallback = false;

function warnFallback(op: string, error: unknown): void {
  if (!usingFallback) {
    console.warn(
      `[Storage] AsyncStorage.${op} failed — falling back to in-memory store. ` +
      `Persistence is disabled for this session.`,
      error,
    );
    usingFallback = true;
  }
}

// ── The Adapter ─────────────────────────────────────────────────────────────

export const resilientStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      warnFallback('getItem', e);
      return memoryStore.get(name) ?? null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      warnFallback('setItem', e);
      memoryStore.set(name, value);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      warnFallback('removeItem', e);
      memoryStore.delete(name);
    }
  },
};
