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
// CRITICAL: Zustand persist may pass raw objects to setItem despite the string
// type signature. The Android Native Bridge will throw a ReadableNativeMap cast
// error if a non-string reaches AsyncStorage. We enforce serialization here.

export const resilientStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const raw = await AsyncStorage.getItem(name);
      if (raw === null || raw === undefined) return null;

      // Attempt to parse stored JSON back into an object.
      // If the value is valid JSON, return the parsed result (Zustand expects this).
      // If it's a raw string that isn't JSON, return it as-is.
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch (e) {
      warnFallback('getItem', e);
      const fallback = memoryStore.get(name) ?? null;
      if (fallback === null) return null;
      try {
        return JSON.parse(fallback);
      } catch {
        return fallback;
      }
    }
  },

  setItem: async (name: string, value: unknown): Promise<void> => {
    // ── STRING ENFORCEMENT ───────────────────────────────────────────────
    // The native bridge ONLY accepts strings. If Zustand's persist middleware
    // passes an object (e.g. the voyage-progress manifest), serialize it.
    const stringValue: string =
      typeof value === 'string' ? value : JSON.stringify(value);

    try {
      await AsyncStorage.setItem(name, stringValue);
    } catch (e) {
      warnFallback('setItem', e);
      memoryStore.set(name, stringValue);
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
