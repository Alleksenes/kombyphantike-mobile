// ── Philological Inspector Store ──────────────────────────────────────────────
// Zustand store for the Island Workbench's Knot Inspector.
// Drives the PhilologicalInspector bottom sheet.

import { create } from 'zustand';
import { Knot } from '../types';

type PhilologicalTab = 'knot' | 'scholia' | 'paradigm';

interface PhilologicalInspectorState {
  knot: Knot | null;
  isOpen: boolean;
  activeTab: PhilologicalTab;
  openInspector: (knot: Knot, tab?: PhilologicalTab) => void;
  closeInspector: () => void;
  setActiveTab: (tab: PhilologicalTab) => void;
}

export const usePhilologicalInspectorStore = create<PhilologicalInspectorState>((set) => ({
  knot: null,
  isOpen: false,
  activeTab: 'knot',
  openInspector: (knot, tab = 'knot') => set({ knot, isOpen: true, activeTab: tab }),
  closeInspector: () => set({ isOpen: false }), // Keep knot for closing animation
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
