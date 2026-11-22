import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { SceneId, Track, UserPlaylist } from "@/lib/types";

type PrefsState = {
  scene: SceneId;
  imageUrl: string | null;
  volume: number;
  muted: boolean;
  liked: string[];
  userPlaylists: UserPlaylist[];
  recents: string[];
  known: Record<string, Track>;
  setScene: (scene: SceneId) => void;
  setImageUrl: (imageUrl: string | null) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleLike: (track: Track) => void;
  remember: (tracks: Track[]) => void;
  pushRecent: (id: string) => void;
  createPlaylist: (name: string) => string | null;
  deletePlaylist: (id: string) => void;
  addTrack: (playlistId: string, track: Track) => void;
  removeTrack: (playlistId: string, trackId: string) => void;
};

const MEMORY: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function browserStorage(): StateStorage {
  if (typeof window === "undefined") return MEMORY;
  return {
    getItem: (name) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        /* cuota llena: la sesión sigue en memoria */
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}

function rememberMap(known: Record<string, Track>, tracks: Track[]) {
  const next = { ...known };
  for (const item of tracks) {
    delete next[item.id];
    next[item.id] = item;
  }
  const ids = Object.keys(next);
  if (ids.length > 180) {
    for (const id of ids.slice(0, ids.length - 180)) delete next[id];
  }
  return next;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      scene: "bruma",
      imageUrl: null,
      volume: 80,
      muted: false,
      liked: [],
      userPlaylists: [],
      recents: [],
      known: {},
      setScene: (scene) => set({ scene }),
      setImageUrl: (imageUrl) => set({ imageUrl }),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      toggleLike: (track) =>
        set((state) => {
          const liked = state.liked.includes(track.id)
            ? state.liked.filter((id) => id !== track.id)
            : [...state.liked, track.id];
          return { liked, known: rememberMap(state.known, [track]) };
        }),
      remember: (tracks) => set((state) => ({ known: rememberMap(state.known, tracks) })),
      pushRecent: (id) =>
        set((state) => ({
          recents: [id, ...state.recents.filter((item) => item !== id)].slice(0, 16),
        })),
      createPlaylist: (name) => {
        const trimmed = name.trim().slice(0, 40);
        if (!trimmed) return null;
        const playlist: UserPlaylist = { id: `p-${Date.now().toString(36)}`, name: trimmed, trackIds: [] };
        set((state) => ({ userPlaylists: [...state.userPlaylists, playlist] }));
        return playlist.id;
      },
      deletePlaylist: (id) =>
        set((state) => ({ userPlaylists: state.userPlaylists.filter((playlist) => playlist.id !== id) })),
      addTrack: (playlistId, track) =>
        set((state) => ({
          known: rememberMap(state.known, [track]),
          userPlaylists: state.userPlaylists.map((playlist) =>
            playlist.id === playlistId && !playlist.trackIds.includes(track.id)
              ? { ...playlist, trackIds: [...playlist.trackIds, track.id] }
              : playlist,
          ),
        })),
      removeTrack: (playlistId, trackId) =>
        set((state) => ({
          userPlaylists: state.userPlaylists.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) }
              : playlist,
          ),
        })),
    }),
    {
      name: "aurasound-prefs-v1",
      storage: createJSONStorage(browserStorage),
      skipHydration: true,
      partialize: (state) => ({
        scene: state.scene,
        imageUrl: state.imageUrl,
        volume: state.volume,
        muted: state.muted,
        liked: state.liked,
        userPlaylists: state.userPlaylists,
        recents: state.recents,
        known: state.known,
      }),
    },
  ),
);
