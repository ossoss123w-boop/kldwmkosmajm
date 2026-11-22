import { searchCatalog } from "@/lib/catalog";
import type { SearchResponse, Track } from "@/lib/types";

/**
 * Instancias públicas, en orden de preferencia.
 * Si una cae, se prueba la siguiente. Edita estas listas sin tocar el resto.
 * Invidious suele devolver el vídeo oficial; Piped es el respaldo.
 */
const INVIDIOUS = [
  "https://invidious.materialio.us",
  "https://inv.nadeko.net",
  "https://yt.chocolatemoo53.com",
];

const PIPED = [
  "https://api.piped.private.coffee",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
];

const UA = "Mozilla/5.0 (compatible; AuraSound/1.0; +https://aurasound.app)";
const cache = new Map<string, { at: number; body: SearchResponse }>();

function cleanTitle(raw: string) {
  return raw
    .replace(/\s*[([].*?(official|oficial|video|audio|lyric|lyrics|hd|4k|remaster|visualizer).*?[)\]]/gi, "")
    .replace(/\s*[-–|]?\s*(official\s+(music\s+)?(video|audio)|video oficial|audio oficial|lyric video)\s*$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitCredit(title: string, author: string) {
  let artist = author
    .replace(/\s*-\s*Topic$/i, "")
    .replace(/VEVO$/i, "")
    .replace(/\s+Official$/i, "")
    .trim();
  let name = cleanTitle(title);
  const parts = name.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    const left = parts[0]?.trim() ?? "";
    const right = parts.slice(1).join(" - ").trim();
    const loose = artist.toLowerCase();
    const head = left.toLowerCase();
    if (head && loose && (loose.includes(head.slice(0, 8)) || head.includes(loose.slice(0, 8)))) {
      artist = left;
      name = right;
    }
  }
  return {
    title: name || title,
    artist: artist || "YouTube",
  };
}

async function readJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal,
    headers: { accept: "application/json", "user-agent": UA },
  });
  if (!response.ok) throw new Error(String(response.status));
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("json")) throw new Error("not-json");
  return response.json();
}

function take(tracks: Track[]) {
  const seen = new Set<string>();
  const next: Track[] = [];
  for (const item of tracks) {
    if (!item.id || seen.has(item.id)) continue;
    if (item.duration > 0 && (item.duration < 45 || item.duration > 900)) continue;
    if (/#shorts/i.test(item.title)) continue;
    seen.add(item.id);
    next.push(item);
    if (next.length >= 20) break;
  }
  return next;
}

async function fromInvidious(base: string, query: string, signal: AbortSignal) {
  const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
  const data: unknown = await readJson(url, signal);
  if (!Array.isArray(data)) throw new Error("shape");
  const tracks: Track[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    if (item.type !== "video" || item.liveNow === true) continue;
    if (typeof item.videoId !== "string" || typeof item.title !== "string") continue;
    const author = typeof item.author === "string" ? item.author : "YouTube";
    const credit = splitCredit(item.title, author);
    const duration = typeof item.lengthSeconds === "number" ? item.lengthSeconds : 0;
    tracks.push({ id: item.videoId, title: credit.title, artist: credit.artist, duration });
  }
  return take(tracks);
}

async function fromPiped(base: string, query: string, signal: AbortSignal) {
  let lastError: unknown;
  for (const filter of ["videos", "music_songs", "all"]) {
    const url = `${base}/search?q=${encodeURIComponent(query)}&filter=${filter}`;
    try {
      const data = (await readJson(url, signal)) as { items?: unknown };
      const items = Array.isArray(data.items) ? data.items : null;
      if (!items) throw new Error("shape");
      const tracks: Track[] = [];
      for (const row of items) {
        if (!row || typeof row !== "object") continue;
        const item = row as Record<string, unknown>;
        if (item.type !== "stream" || typeof item.url !== "string" || typeof item.title !== "string") continue;
        const id = new URL(item.url, "https://piped.video").searchParams.get("v");
        if (!id) continue;
        const author = typeof item.uploaderName === "string" ? item.uploaderName : "YouTube";
        const credit = splitCredit(item.title, author);
        const duration = typeof item.duration === "number" ? item.duration : 0;
        tracks.push({ id, title: credit.title, artist: credit.artist, duration });
      }
      return take(tracks);
    } catch (error) {
      lastError = error;
      if (signal.aborted) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("piped");
}

async function firstHit(
  bases: string[],
  query: string,
  load: (base: string, query: string, signal: AbortSignal) => Promise<Track[]>,
) {
  for (const base of bases) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const results = await load(base, query, controller.signal);
      if (results.length) return results;
    } catch {
      /* prueba la siguiente instancia */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export async function runSearch(query: string): Promise<SearchResponse> {
  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.body;

  const invidious = await firstHit(INVIDIOUS, query, fromInvidious);
  if (invidious) {
    const body: SearchResponse = { results: invidious, source: "invidious" };
    cache.set(key, { at: Date.now(), body });
    return body;
  }

  const piped = await firstHit(PIPED, query, fromPiped);
  if (piped) {
    const body: SearchResponse = { results: piped, source: "piped" };
    cache.set(key, { at: Date.now(), body });
    return body;
  }

  const local = searchCatalog(query);
  return {
    results: local,
    source: "local",
    warning: local.length
      ? "Las instancias públicas no respondieron. Mostrando coincidencias del catálogo de AuraSound."
      : "No hay resultados y las instancias públicas no respondieron.",
  };
}
