import { create } from 'zustand';
import { Token } from '../../components/WordChip';

interface InspectorState {
  token: Token | null;
  isOpen: boolean;
  openInspector: (token: Token) => void;
  closeInspector: () => void;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  token: null,
  isOpen: false,
  openInspector: (token) => set({ token, isOpen: true }),
  closeInspector: () => set({ isOpen: false }), // We keep the token to allow closing animation to show content
}));
