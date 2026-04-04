// ── THE VOYAGE STORE ─────────────────────────────────────────────────────────
// Client-side sentence sequencer built on top of IslandDTO.sentences.
// No new backend endpoints — consumes the existing GET /islands/{id} data.
//
// Manages: sentence-by-sentence navigation, mastery tracking, position persistence.
// Persisted via Zustand persist middleware + resilient storage adapter.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resilientStorage } from './storage';
import {
  CuratedSentenceDTO,
  IslandDTO,
  MasteryState,
  VoyageManifest,
  VoyageSentence,
} from '../types';
import { ApiService } from '../services/ApiService';

// ── State Interface ─────────────────────────────────────────────────────────

interface VoyageState {
  // The active voyage
  manifest: VoyageManifest | null;

  // Loading & error
  isLoading: boolean;
  error: string | null;

  // Actions
  loadVoyage: (island: IslandDTO) => void;
  /** Fetch island from API by ID and initialize the voyage. */
  loadVoyageById: (islandId: string) => Promise<void>;
  nextSentence: () => void;
  previousSentence: () => void;
  goToSentence: (index: number) => void;
  markSeen: (sentenceId: string) => void;
  markPracticed: (sentenceId: string) => void;
  markMastered: (sentenceId: string) => void;
  resetVoyage: () => void;
}

// ── Mastery Weight Map (for progress calculation) ────────────────────────────

const MASTERY_WEIGHT: Record<MasteryState, number> = {
  unseen: 0,
  seen: 0.33,
  practiced: 0.66,
  mastered: 1,
};

// ── Computed Helpers (pure functions, not in the store) ──────────────────────

/** Get the current sentence from a manifest, or null. */
export function getCurrentSentence(manifest: VoyageManifest | null): VoyageSentence | null {
  if (!manifest || manifest.sentences.length === 0) return null;
  return manifest.sentences[manifest.current_index] ?? null;
}

/** Calculate overall voyage progress as a percentage (0–100). */
export function getVoyageProgress(manifest: VoyageManifest | null): number {
  if (!manifest || manifest.sentences.length === 0) return 0;
  const total = manifest.sentences.reduce(
    (acc, s) => acc + MASTERY_WEIGHT[s.mastery],
    0,
  );
  return Math.round((total / manifest.sentences.length) * 100);
}

/** Get the total number of sentences in the voyage. */
export function getSentenceCount(manifest: VoyageManifest | null): number {
  return manifest?.sentences.length ?? 0;
}

// ── The Store ───────────────────────────────────────────────────────────────

export const useVoyageStore = create<VoyageState>()(
  persist(
    (set, get) => ({
      manifest: null,
      isLoading: false,
      error: null,

      loadVoyage: (island: IslandDTO) => {
        const existing = get().manifest;

        // Resume if we have a persisted voyage for this island
        if (existing && existing.island_id === island.id) {
          // Refresh sentence content (may have updated from backend)
          // but preserve mastery states and current_index
          const refreshed = mergeSentences(existing.sentences, island.sentences);
          set({
            manifest: { ...existing, sentences: refreshed },
            isLoading: false,
            error: null,
          });
          return;
        }

        // Fresh voyage: wrap each sentence with sequence_index + mastery: 'unseen'
        const sentences: VoyageSentence[] = island.sentences.map((s, i) => ({
          ...s,
          sequence_index: i,
          mastery: 'unseen' as MasteryState,
        }));

        set({
          manifest: {
            island_id: island.id,
            sentences,
            current_index: 0,
            started_at: new Date().toISOString(),
          },
          isLoading: false,
          error: null,
        });
      },

      loadVoyageById: async (islandId: string) => {
        const { loadVoyage, manifest } = get();

        // Skip fetch if we already have a manifest for this island
        if (manifest && manifest.island_id === islandId) {
          set({ isLoading: false, error: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const island = await ApiService.getIsland(islandId);
          loadVoyage(island);
        } catch (e: any) {
          console.error('[VoyageStore] API fetch failed:', e.message);
          set({ error: `API unreachable. (${e.message})` });
        } finally {
          // ALWAYS release the loader — even if storage or API throws.
          // Without this, the UI stays stuck on the ActivityIndicator.
          set({ isLoading: false });
        }
      },

      nextSentence: () => {
        const { manifest } = get();
        if (!manifest) return;
        const nextIdx = Math.min(manifest.current_index + 1, manifest.sentences.length - 1);

        // Auto-mark the sentence we're leaving as 'seen' (if still unseen)
        const sentences = [...manifest.sentences];
        if (sentences[manifest.current_index]?.mastery === 'unseen') {
          sentences[manifest.current_index] = {
            ...sentences[manifest.current_index],
            mastery: 'seen',
          };
        }

        set({ manifest: { ...manifest, sentences, current_index: nextIdx } });
      },

      previousSentence: () => {
        const { manifest } = get();
        if (!manifest) return;
        const prevIdx = Math.max(manifest.current_index - 1, 0);
        set({ manifest: { ...manifest, current_index: prevIdx } });
      },

      goToSentence: (index: number) => {
        const { manifest } = get();
        if (!manifest) return;
        const clamped = Math.max(0, Math.min(index, manifest.sentences.length - 1));
        set({ manifest: { ...manifest, current_index: clamped } });
      },

      markSeen: (sentenceId: string) => {
        updateMastery(set, get, sentenceId, 'seen');
      },

      markPracticed: (sentenceId: string) => {
        updateMastery(set, get, sentenceId, 'practiced');
      },

      markMastered: (sentenceId: string) => {
        updateMastery(set, get, sentenceId, 'mastered');
      },

      resetVoyage: () => {
        set({ manifest: null, isLoading: false, error: null });
      },
    }),
    {
      name: 'voyage-progress',
      storage: resilientStorage,
      // Persist the full manifest (includes mastery states + current_index)
      partialize: (state) => ({ manifest: state.manifest }),
    },
  ),
);

// ── Internal Helpers ─────────────────────────────────────────────────────────

/** Update mastery for a sentence, only if it's an advancement (never regress). */
function updateMastery(
  set: (fn: (s: VoyageState) => Partial<VoyageState>) => void,
  get: () => VoyageState,
  sentenceId: string,
  newMastery: MasteryState,
) {
  const { manifest } = get();
  if (!manifest) return;

  const ORDER: MasteryState[] = ['unseen', 'seen', 'practiced', 'mastered'];
  const newIdx = ORDER.indexOf(newMastery);

  const sentences = manifest.sentences.map((s) => {
    if (s.id !== sentenceId) return s;
    const currentIdx = ORDER.indexOf(s.mastery);
    // Only advance, never regress
    if (newIdx > currentIdx) {
      return { ...s, mastery: newMastery };
    }
    return s;
  });

  set(() => ({ manifest: { ...manifest, sentences } }));
}

/** Merge fresh backend sentences with persisted mastery states. */
function mergeSentences(
  persisted: VoyageSentence[],
  fresh: CuratedSentenceDTO[],
): VoyageSentence[] {
  const masteryMap = new Map<string, MasteryState>();
  persisted.forEach((s) => masteryMap.set(s.id, s.mastery));

  return fresh.map((s, i) => ({
    ...s,
    sequence_index: i,
    mastery: masteryMap.get(s.id) ?? 'unseen',
  }));
}
