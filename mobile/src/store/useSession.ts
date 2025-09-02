import { create } from 'zustand';

interface SessionState {
  isOnboarded: boolean;
  isReady: boolean;
  
  // Actions
  setOnboarded: (value: boolean) => void;
  setReady: (value: boolean) => void;
}

export const useSession = create<SessionState>((set) => ({
  isOnboarded: false,
  isReady: false,

  setOnboarded: (value: boolean) => set({ isOnboarded: value }),
  setReady: (value: boolean) => set({ isReady: value }),
}));
