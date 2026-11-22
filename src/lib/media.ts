import type { Track } from "@/lib/types";

export function artwork(id: string, quality: "hqdefault" | "mqdefault" | "default" = "hqdefault") {
  return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/${quality}.jpg`;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function sessionArtwork(track: Track) {
  return [
    { src: artwork(track.id, "default"), sizes: "120x90", type: "image/jpeg" },
    { src: artwork(track.id, "mqdefault"), sizes: "320x180", type: "image/jpeg" },
    { src: artwork(track.id, "hqdefault"), sizes: "480x360", type: "image/jpeg" },
  ];
}
