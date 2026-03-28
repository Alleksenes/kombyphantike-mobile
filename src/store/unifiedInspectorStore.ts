// ── THE UNIFIED INSPECTOR STORE ──────────────────────────────────────────────
// Merges the old philologicalInspectorStore + inspectorStore into one.
// Drives the single PhilologicalInspector bottom sheet with Progressive Disclosure.
//
// Key design:
// - profileCache: persisted Map<lemma, ContrastiveProfile> for offline access
// - disclosureLevel: 'translation' → 'audio' → 'knot' → 'etymology'
// - "Shallow Knot" resilience: accepts both Knot and Token-shaped objects
//   without crashing on missing fields (david_note, grammar_scholia, etc.)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Knot, ContrastiveProfile, DisclosureLevel } from '../types';
import { ApiService } from '../services/ApiService';

// ── Mock Fallback Profile ───────────────────────────────────────────────────
// Used when the API is unreachable (UI-First Mode).
// Synthesizes a ContrastiveProfile from the knot's existing fields.
function buildMockProfile(knot: Knot): ContrastiveProfile {
  return {
    david_note: knot.david_note || `Diachronic note for '${knot.lemma}' — awaiting philological excavation.`,
    rag_scholia: knot.rag_scholia || 'Holton et al. — reference pending integration.',
    grammar_scholia: knot.grammar_scholia || `The morphological profile of '${knot.lemma}' (${knot.pos}) reflects standard Modern Greek inflection patterns.`,
    lsj_definitions: knot.lsj_definitions ?? [`${knot.lemma}: ${knot.definition ?? 'definition pending'}`],
    kds_score: knot.kds_score ?? 0.42,
    paradigm: knot.paradigm ?? [],
    ancient_ancestor: knot.ancient_ancestor,
  };
}

// ── Shallow Knot Adapter ────────────────────────────────────────────────────
// Token objects from constellation.tsx / results.tsx lack david_note, rag_scholia.
// This normalizes any word-like object into a safe Knot shape.

interface ShallowWordlike {
  text: string;
  lemma: string;
  pos: string;
  tag?: string;
  transliteration?: string;
  morphology?: string;
  definition?: string;
  david_note?: string;
  rag_scholia?: string;
  grammar_scholia?: string;
  lsj_definitions?: string[];
  kds_score?: number;
  ancient_ancestor?: string;
  has_paradigm?: boolean;
  paradigm?: { form: string; tags: string[] }[];
  [key: string]: any; // Allow extra Token fields (knot_definition, etc.)
}

export function toKnot(word: ShallowWordlike, id?: string): Knot {
  return {
    id: id ?? `knot-${word.lemma}-${Date.now()}`,
    text: word.text,
    lemma: word.lemma,
    pos: word.pos,
    tag: word.tag,
    transliteration: word.transliteration,
    morphology: word.morphology,
    definition: word.definition ?? word.knot_definition,
    david_note: word.david_note ?? '',
    rag_scholia: word.rag_scholia ?? '',
    grammar_scholia: word.grammar_scholia,
    lsj_definitions: word.lsj_definitions,
    kds_score: word.kds_score,
    ancient_ancestor: word.ancient_ancestor,
    has_paradigm: word.has_paradigm,
    paradigm: word.paradigm,
  };
}

// ── State Interface ─────────────────────────────────────────────────────────

interface UnifiedInspectorState {
  // What is being inspected
  knot: Knot | null;

  // Sheet state
  isOpen: boolean;
  isLoading: boolean;
  inspectError: 'void' | 'network' | null;

  // Progressive disclosure level (replaces 3-tab model)
  disclosureLevel: DisclosureLevel;

  // ContrastiveProfile cache — keyed by lemma
  // Persisted via AsyncStorage for offline access
  profileCache: Record<string, ContrastiveProfile>;

  // Actions
  openInspector: (knot: Knot | ShallowWordlike, level?: DisclosureLevel) => void;
  closeInspector: () => void;
  setDisclosureLevel: (level: DisclosureLevel) => void;
  clearCache: () => void;
}

// ── The Store ───────────────────────────────────────────────────────────────

export const useInspectorStore = create<UnifiedInspectorState>()(
  persist(
    (set, get) => ({
      knot: null,
      isOpen: false,
      isLoading: false,
      inspectError: null,
      disclosureLevel: 'translation',
      profileCache: {},

      openInspector: async (wordlike, level = 'translation') => {
        // Normalize to Knot (Shallow Knot Adapter)
        const knot = 'id' in wordlike && 'david_note' in wordlike && typeof wordlike.david_note === 'string'
          ? (wordlike as Knot)
          : toKnot(wordlike as ShallowWordlike);

        // Check 1: Is the ContrastiveProfile already on the knot?
        const hasProfile = !!(knot.grammar_scholia && knot.david_note && knot.rag_scholia);

        // Check 2: Is it in the cache?
        const cached = get().profileCache[knot.lemma];

        if (hasProfile) {
          // Knot is fully enriched — open instantly
          set({ knot, isOpen: true, disclosureLevel: level, isLoading: false, inspectError: null });
          return;
        }

        if (cached) {
          // Enrich from cache — no API call
          const enriched = enrichKnot(knot, cached);
          set({ knot: enriched, isOpen: true, disclosureLevel: level, isLoading: false, inspectError: null });
          return;
        }

        // No cache — open sheet immediately with what we have, then fetch
        set({ knot, isOpen: true, disclosureLevel: level, isLoading: true, inspectError: null });

        if (!knot.lemma) {
          set({ isLoading: false });
          return;
        }

        try {
          const profile = await ApiService.inspectLemma(knot.lemma);

          if (profile === null) {
            // Philological Void — the diachronic link is lost to time
            set({ isLoading: false, inspectError: 'void' });
            return;
          }

          // Enrich the knot and update cache
          set((state) => {
            // Only update if the same knot is still open (prevent stale writes)
            if (state.knot && state.knot.lemma === knot.lemma) {
              return {
                knot: enrichKnot(state.knot, profile),
                isLoading: false,
                profileCache: {
                  ...state.profileCache,
                  [knot.lemma]: profile,
                },
              };
            }
            // Knot changed while fetching — still cache the profile
            return {
              isLoading: false,
              profileCache: {
                ...state.profileCache,
                [knot.lemma]: profile,
              },
            };
          });
        } catch (e) {
          console.warn('API unreachable — falling back to mock profile:', e);
          // UI-FIRST MODE: Synthesize a mock ContrastiveProfile so the Inspector
          // always has something to render, even without a backend.
          const mockProfile = buildMockProfile(knot);
          set((state) => {
            if (state.knot && state.knot.lemma === knot.lemma) {
              return {
                knot: enrichKnot(state.knot, mockProfile),
                isLoading: false,
                inspectError: null, // No error — mock data is valid
                profileCache: {
                  ...state.profileCache,
                  [knot.lemma]: mockProfile,
                },
              };
            }
            return { isLoading: false };
          });
        }
      },

      closeInspector: () => set({ isOpen: false, inspectError: null }),
      // Keep knot for closing animation — cleared on next open

      setDisclosureLevel: (level) => set({ disclosureLevel: level }),

      clearCache: () => set({ profileCache: {} }),
    }),
    {
      name: 'inspector-profile-cache',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the profile cache — not the sheet UI state
      partialize: (state) => ({ profileCache: state.profileCache }),
    },
  ),
);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Enrich a Knot with data from a ContrastiveProfile. */
function enrichKnot(knot: Knot, profile: ContrastiveProfile): Knot {
  // Map API collocations (text + frequency) → Knot ngrams (string[])
  const ngrams = profile.collocations?.length
    ? profile.collocations.map((c) => c.text)
    : knot.ngrams;

  return {
    ...knot,
    david_note: profile.david_note || knot.david_note,
    rag_scholia: profile.rag_scholia || knot.rag_scholia,
    grammar_scholia: profile.grammar_scholia,
    lsj_definitions: profile.lsj_definitions,
    kds_score: profile.kds_score,
    paradigm: profile.paradigm,
    has_paradigm: Array.isArray(profile.paradigm) && profile.paradigm.length > 0,
    ancient_ancestor: profile.ancient_ancestor ?? knot.ancient_ancestor,
    idioms: profile.idioms ?? knot.idioms,
    ngrams,
  };
}

// ── Legacy Compatibility ─────────────────────────────────────────────────────
// Re-export the old store name for consumers that haven't been updated yet.
export const usePhilologicalInspectorStore = useInspectorStore;
