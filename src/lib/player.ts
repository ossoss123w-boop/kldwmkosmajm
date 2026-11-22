import { create } from "zustand";
import type { AppView, RepeatMode, Track } from "@/lib/types";

type PlayerState = {
  view: AppView;
  query: string;
  libraryFocus: string | null;
  queue: Track[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number;
  duration: number;
  error: string | null;
  setView: (view: AppView) => void;
  setQuery: (query: string) => void;
  setLibraryFocus: (libraryFocus: string | null) => void;
};

export const usePlayer = create<PlayerState>()((set) => ({
  view: "home",
  query: "",
  libraryFocus: null,
  queue: [],
  index: 0,
  playing: false,
  shuffle: false,
  repeat: "off",
  progress: 0,
  duration: 0,
  error: null,
  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  setLibraryFocus: (libraryFocus) => set({ libraryFocus }),
}));

export function useCurrentTrack() {
  return usePlayer((state) => state.queue[state.index] ?? null);
}
