import { useEffect, useState } from "react";
import { searchCatalog } from "@/lib/catalog";
import { artwork, formatTime } from "@/lib/media";
import { playTrack } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { searchTracks } from "@/lib/search.functions";
import type { Track } from "@/lib/types";

const SUGGESTIONS = ["Rosalía", "The Weeknd", "Queen", "Bad Bunny", "Dua Lipa", "Arctic Monkeys"];

export function SearchView() {
  const query = usePlayer((state) => state.query);
  const setQuery = usePlayer((state) => state.setQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setStatus("idle");
      setNote(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("loading");
      searchTracks({ data: { q }, signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return;
          setResults(response.results);
          setNote(response.warning ?? null);
          setStatus("done");
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          const local = searchCatalog(q);
          setResults(local);
          setNote(
            local.length
              ? "La búsqueda remota falló. Mostrando coincidencias del catálogo."
              : "No se pudo completar la búsqueda.",
          );
          setStatus("done");
        });
    }, 360);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (query.trim().length < 2) {
    return (
      <div>
        <h2>Buscar</h2>
        <p className="note">Encuentra canciones en YouTube y reprodúcelas al momento, solo el audio.</p>
        <div className="chips">
          {SUGGESTIONS.map((name) => (
            <button key={name} type="button" className="chip" onClick={() => setQuery(name)}>
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Resultados</h2>
      {status === "loading" ? <p className="note">Buscando…</p> : null}
      {note ? <p className="note">{note}</p> : null}
      {status === "done" && results.length === 0 ? <p className="note">Sin resultados para «{query.trim()}».</p> : null}
      <ul className="result-list">
        {results.map((track) => (
          <li key={track.id}>
            <button type="button" className="result-row glass" onClick={() => void playTrack(track, results)}>
              <img src={artwork(track.id)} alt="" />
              <span>
                <span className="result-title clamp-2">{track.title}</span>
                <span className="result-artist">{track.artist}</span>
              </span>
              <span className="result-artist">{track.duration ? formatTime(track.duration) : ""}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
