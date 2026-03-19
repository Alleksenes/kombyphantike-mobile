// ── Curriculum Store (The Library) ───────────────────────────────────────────
// Zustand store for the island curriculum.
// Fetches all islands from the backend; error state prevents silent crashes.

import { create } from 'zustand';
import { ApiService } from '../services/ApiService';
import { IslandDTO } from '../types';

interface CurriculumState {
  islands: IslandDTO[];
  isLoading: boolean;
  error: string | null;

  /** Fetch all curriculum islands from the backend. */
  fetchIslands: () => Promise<void>;
}

export const useCurriculumStore = create<CurriculumState>((set) => ({
  islands: [],
  isLoading: false,
  error: null,

  fetchIslands: async () => {
    set({ isLoading: true, error: null });
    try {
      const islands = await ApiService.getCurriculumIslands();
      set({ islands, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load curriculum.';
      set({ islands: [], isLoading: false, error: message });
    }
  },
}));
