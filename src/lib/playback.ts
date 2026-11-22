import { BRAND } from "@/lib/brand";
import { sessionArtwork } from "@/lib/media";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import type { Track } from "@/lib/types";
import {
  applyVolume,
  ensurePlayer,
  getLoadedId,
  loadAndPlay,
  pauseVideo,
  playVideo,
  readTimes,
  seekTo,
  setPlayerHooks,
} from "@/lib/youtube";

let ticker = 0;
let sessionReady = false;
let holdPauseUntil = 0;

function holdPause() {
  holdPauseUntil = Date.now() + 900;
}

function currentTrack() {
  const { queue, index } = usePlayer.getState();
  return queue[index] ?? null;
}

function syncSession(track: Track | null, playing: boolean) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  if (!track) {
    navigator.mediaSession.playbackState = "none";
    return;
  }
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: BRAND.name,
    artwork: sessionArtwork(track),
  });
  navigator.mediaSession.playbackState = playing ? "playing" : "paused";
}

function publishPosition(progress: number, duration: number) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !(duration > 0)) return;
  const position = Math.min(Math.max(progress, 0), Math.max(duration - 0.05, 0));
  try {
    navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position });
  } catch {
    /* algunos navegadores rechazan el estado si aún no hay metadata */
  }
}

function stopTicker() {
  window.clearInterval(ticker);
  ticker = 0;
}

function startTicker() {
  stopTicker();
  ticker = window.setInterval(() => {
    const times = readTimes();
    const prev = usePlayer.getState();
    const duration = times.duration || prev.duration;
    if (Math.abs(times.progress - prev.progress) < 0.25 && duration === prev.duration) return;
    usePlayer.setState({ progress: times.progress, duration });
    publishPosition(times.progress, duration);
  }, 500);
}

async function arm(track: Track) {
  holdPause();
  usePrefs.getState().remember([track]);
  usePrefs.getState().pushRecent(track.id);
  syncSession(track, true);
  await ensurePlayer();
  installMediaSession();
  loadAndPlay(track.id);
}

export async function playTrack(track: Track, queue?: Track[]) {
  const list = queue && queue.length > 0 ? queue : [track];
  const index = Math.max(0, list.findIndex((item) => item.id === track.id));
  usePrefs.getState().remember(list);
  usePlayer.setState({
    queue: list,
    index,
    playing: true,
    error: null,
    progress: 0,
    duration: track.duration || 0,
  });
  try {
    await arm(track);
  } catch {
    usePlayer.setState({
      playing: false,
      error: "No se pudo cargar el reproductor de YouTube. Inténtalo de nuevo.",
    });
  }
}

export async function playIndex(index: number) {
  const track = usePlayer.getState().queue[index];
  if (!track) return;
  usePlayer.setState({
    index,
    playing: true,
    error: null,
    progress: 0,
    duration: track.duration || 0,
  });
  try {
    await arm(track);
  } catch {
    usePlayer.setState({ playing: false, error: "No se pudo cambiar de pista." });
  }
}

export async function togglePlay() {
  const track = currentTrack();
  if (!track) return;
  if (usePlayer.getState().playing) {
    pauseVideo();
    stopTicker();
    usePlayer.setState({ playing: false });
    syncSession(track, false);
    return;
  }
  usePlayer.setState({ playing: true, error: null });
  try {
    holdPause();
    await ensurePlayer();
    installMediaSession();
    syncSession(track, true);
    if (getLoadedId() === track.id) playVideo();
    else loadAndPlay(track.id);
  } catch {
    usePlayer.setState({ playing: false, error: "Pulsa reproducir otra vez para activar el audio." });
  }
}

export async function next() {
  const { queue, index, repeat } = usePlayer.getState();
  if (!queue.length) return;
  if (index + 1 < queue.length) {
    await playIndex(index + 1);
    return;
  }
  if (repeat === "all") {
    await playIndex(0);
    return;
  }
  stopTicker();
  usePlayer.setState({ playing: false, progress: 0 });
  syncSession(currentTrack(), false);
}

export async function prev() {
  const { queue, index, progress } = usePlayer.getState();
  if (!queue.length) return;
  if (progress > 3) {
    seek(0);
    return;
  }
  const target = index <= 0 ? queue.length - 1 : index - 1;
  await playIndex(target);
}

export function seek(seconds: number) {
  const duration = usePlayer.getState().duration;
  const nextTime = Math.min(Math.max(0, seconds), duration > 0 ? duration : seconds);
  usePlayer.setState({ progress: nextTime });
  seekTo(nextTime);
  publishPosition(nextTime, duration);
}

export function setVolume(volume: number) {
  const next = Math.min(100, Math.max(0, Math.round(volume)));
  usePrefs.getState().setVolume(next);
  if (next > 0) usePrefs.getState().setMuted(false);
  applyVolume(next);
}

export function toggleMute() {
  const { muted, volume } = usePrefs.getState();
  const next = !muted;
  usePrefs.getState().setMuted(next);
  applyVolume(next ? 0 : volume);
}

export function toggleShuffle() {
  const { shuffle, queue, index } = usePlayer.getState();
  if (!shuffle && queue.length > 1) {
    const current = queue[index];
    const rest = queue.filter((_, itemIndex) => itemIndex !== index);
    for (let cursor = rest.length - 1; cursor > 0; cursor -= 1) {
      const swap = Math.floor(Math.random() * (cursor + 1));
      const left = rest[cursor];
      const right = rest[swap];
      if (left && right) {
        rest[cursor] = right;
        rest[swap] = left;
      }
    }
    usePlayer.setState({
      shuffle: true,
      queue: current ? [current, ...rest] : rest,
      index: 0,
    });
    return;
  }
  usePlayer.setState({ shuffle: !shuffle });
}

export function cycleRepeat() {
  const order = ["off", "all", "one"] as const;
  const { repeat } = usePlayer.getState();
  const next = order[(order.indexOf(repeat) + 1) % order.length] ?? "off";
  usePlayer.setState({ repeat: next });
}

function onEnded() {
  const { repeat, index, queue } = usePlayer.getState();
  if (repeat === "one") {
    const track = queue[index];
    if (!track) return;
    holdPause();
    usePlayer.setState({ playing: true, progress: 0, error: null });
    loadAndPlay(track.id);
    syncSession(track, true);
    return;
  }
  if (index + 1 < queue.length) {
    void playIndex(index + 1);
    return;
  }
  if (repeat === "all" && queue.length) {
    void playIndex(0);
    return;
  }
  stopTicker();
  usePlayer.setState({ playing: false });
  syncSession(currentTrack(), false);
}

function installMediaSession() {
  if (sessionReady || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  sessionReady = true;
  const bind = (action: MediaSessionAction, run: () => void) => {
    try {
      navigator.mediaSession.setActionHandler(action, run);
    } catch {
      /* el navegador no expone esta acción */
    }
  };
  bind("play", () => {
    if (!usePlayer.getState().playing) void togglePlay();
  });
  bind("pause", () => {
    if (usePlayer.getState().playing) void togglePlay();
  });
  bind("previoustrack", () => void prev());
  bind("nexttrack", () => void next());
  bind("seekbackward", () => seek(usePlayer.getState().progress - 10));
  bind("seekforward", () => seek(usePlayer.getState().progress + 10));
  try {
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });
  } catch {
    /* ignore */
  }
}

setPlayerHooks({
  onState: (code) => {
    const track = currentTrack();
    if (code === 1) {
      usePlayer.setState({ playing: true, error: null });
      startTicker();
      syncSession(track, true);
      return;
    }
    if (code === 2) {
      if (Date.now() < holdPauseUntil) return;
      stopTicker();
      usePlayer.setState({ playing: false });
      syncSession(track, false);
      return;
    }
    if (code === 0) onEnded();
  },
  onError: (code) => {
    stopTicker();
    usePlayer.setState({
      playing: false,
      error:
        code === 101 || code === 150
          ? "Este vídeo no permite reproducirse embebido. Prueba otro resultado."
          : "No se pudo reproducir esta pista.",
    });
    syncSession(currentTrack(), false);
  },
});
