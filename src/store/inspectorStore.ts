import { create } from 'zustand';
import { Token } from '../../components/WordChip';

interface InspectorState {
  token: Token | null;
  isOpen: boolean;
  inspect: (token: Token) => void;
  close: () => void;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  token: null,
  isOpen: false,
  inspect: (token) => set({ token, isOpen: true }),
  close: () => set({ isOpen: false }), // We keep the token to allow closing animation to show content
}));