// ── Philological Inspector Store ──────────────────────────────────────────────
// Zustand store for the Island Workbench's Knot Inspector.
// Drives the PhilologicalInspector bottom sheet.

import { create } from 'zustand';
import { Knot } from '../types';
import { ApiService } from '../services/ApiService';

type PhilologicalTab = 'knot' | 'scholia' | 'paradigm';

interface PhilologicalInspectorState {
  knot: Knot | null;
  isOpen: boolean;
  isLoading: boolean;
  inspectError: 'void' | 'network' | null;
  activeTab: PhilologicalTab;
  openInspector: (knot: Knot, tab?: PhilologicalTab) => void;
  closeInspector: () => void;
  setActiveTab: (tab: PhilologicalTab) => void;
}

export const usePhilologicalInspectorStore = create<PhilologicalInspectorState>((set) => ({
  knot: null,
  isOpen: false,
  isLoading: false,
  inspectError: null,
  activeTab: 'knot',
  openInspector: async (knot, tab = 'knot') => {
    // Zero API Calls if ContrastiveProfile already loaded
    if (knot.david_note && knot.rag_scholia && knot.grammar_scholia) {
      set({ knot, isOpen: true, activeTab: tab, isLoading: false, inspectError: null });
      return;
    }

    set({ knot, isOpen: true, activeTab: tab, isLoading: true, inspectError: null });
    try {
      if (knot.lemma) {
        const data = await ApiService.inspectLemma(knot.lemma);

        if (data === null) {
          // Philological Void — the diachronic link is lost to time
          set({ isLoading: false, inspectError: 'void' });
          return;
        }

        set((state) => {
          if (state.knot && state.knot.id === knot.id) {
            return {
              knot: {
                ...state.knot,
                david_note: data.david_note,
                rag_scholia: data.rag_scholia,
                grammar_scholia: data.grammar_scholia,
                lsj_definitions: data.lsj_definitions,
                kds_score: data.kds_score,
                paradigm: data.paradigm,
                has_paradigm: Array.isArray(data.paradigm) && data.paradigm.length > 0,
              },
              isLoading: false,
            };
          }
          return { isLoading: false };
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to inspect lemma:', e);
      set({ isLoading: false, inspectError: 'network' });
    }
  },
  closeInspector: () => set({ isOpen: false, inspectError: null }), // Keep knot for closing animation
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
