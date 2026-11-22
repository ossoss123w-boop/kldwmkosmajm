import { usePrefs } from "@/lib/prefs";

/**
 * Reproductor oficial de YouTube, en un iframe de 1×1.
 * No usamos display:none: algunos navegadores suspenden el audio oculto así.
 * El script solo se descarga tras el primer gesto, para no tocar la red al abrir.
 */

type YTPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
};

type Hooks = {
  onState: (code: number) => void;
  onError: (code: number) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: unknown) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
let creating: Promise<void> | null = null;
let player: YTPlayer | null = null;
let pendingId: string | null = null;
let loadedId: string | null = null;
const hooks: Hooks = { onState: () => undefined, onError: () => undefined };

export function setPlayerHooks(next: Hooks) {
  hooks.onState = next.onState;
  hooks.onError = next.onError;
}

export function preloadApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("yt-script"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function ensurePlayer() {
  if (player) return Promise.resolve();
  if (creating) return creating;
  creating = preloadApi()
    .then(
      () =>
        new Promise<void>((resolve, reject) => {
          const host = document.createElement("div");
          host.id = "yt-audio-host";
          host.className = "yt-host";
          host.setAttribute("aria-hidden", "true");
          document.body.appendChild(host);
          const timeout = window.setTimeout(() => reject(new Error("yt-timeout")), 15000);
          const YT = window.YT;
          if (!YT?.Player) {
            window.clearTimeout(timeout);
            reject(new Error("yt-missing"));
            return;
          }
          new YT.Player(host, {
            width: "1",
            height: "1",
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              iv_load_policy: 3,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: { target: YTPlayer }) => {
                window.clearTimeout(timeout);
                player = event.target;
                const { volume, muted } = usePrefs.getState();
                applyVolume(muted ? 0 : volume);
                if (pendingId) player.loadVideoById(pendingId);
                resolve();
              },
              onStateChange: (event: { data: number }) => hooks.onState(event.data),
              onError: (event: { data: number }) => hooks.onError(event.data),
            },
          });
        }),
    )
    .catch((error: unknown) => {
      creating = null;
      throw error;
    });
  return creating;
}

export function loadAndPlay(id: string) {
  loadedId = id;
  pendingId = id;
  try {
    player?.loadVideoById(id);
  } catch {
    /* el onError del iframe informa al usuario */
  }
}

export function getLoadedId() {
  return loadedId;
}

export function playVideo() {
  try {
    player?.playVideo();
  } catch {
    /* ignore */
  }
}

export function pauseVideo() {
  try {
    player?.pauseVideo();
  } catch {
    /* ignore */
  }
}

export function seekTo(seconds: number) {
  try {
    player?.seekTo(seconds, true);
  } catch {
    /* ignore */
  }
}

export function applyVolume(volume: number) {
  if (!player) return;
  try {
    player.setVolume(volume);
    if (volume <= 0) player.mute();
    else player.unMute();
  } catch {
    /* ignore */
  }
}

export function readTimes() {
  if (!player) return { progress: 0, duration: 0 };
  try {
    return {
      progress: player.getCurrentTime() || 0,
      duration: player.getDuration() || 0,
    };
  } catch {
    return { progress: 0, duration: 0 };
  }
}
