import { useState } from "react";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { PLAYLISTS, tracksFrom } from "@/lib/catalog";
import { artwork, formatTime } from "@/lib/media";
import { playTrack } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import type { Track } from "@/lib/types";

export function LibraryView() {
  const focus = usePlayer((state) => state.libraryFocus);
  const setFocus = usePlayer((state) => state.setLibraryFocus);
  const liked = usePrefs((state) => state.liked);
  const known = usePrefs((state) => state.known);
  const userPlaylists = usePrefs((state) => state.userPlaylists);
  const createPlaylist = usePrefs((state) => state.createPlaylist);
  const deletePlaylist = usePrefs((state) => state.deletePlaylist);
  const removeTrack = usePrefs((state) => state.removeTrack);
  const [name, setName] = useState("");

  if (!focus) {
    return (
      <div>
        <h2>Tu biblioteca</h2>
        <p className="note">Playlists de AuraSound y las que guardes en este navegador.</p>
        <form
          className="create-row"
          onSubmit={(event) => {
            event.preventDefault();
            const id = createPlaylist(name);
            if (id) {
              setName("");
              setFocus(id);
            }
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre de la playlist"
            aria-label="Nombre de la playlist"
            maxLength={40}
          />
          <button type="submit" className="solid-btn">
            Crear
          </button>
        </form>
        <div className="tile-grid">
          <button type="button" className="tile glass" onClick={() => setFocus("likes")}>
            <span className="tile-mark" aria-hidden="true">
              <Heart />
            </span>
            <span>
              <strong>Me gusta</strong>
              <p>{liked.length} canciones</p>
            </span>
          </button>
          {PLAYLISTS.map((playlist) => (
            <button key={playlist.id} type="button" className="tile glass" onClick={() => setFocus(playlist.id)}>
              <span className="tile-mark">{playlist.name.slice(0, 1)}</span>
              <span>
                <strong>{playlist.name}</strong>
                <p>{playlist.description}</p>
              </span>
            </button>
          ))}
          {userPlaylists.map((playlist) => (
            <button key={playlist.id} type="button" className="tile glass" onClick={() => setFocus(playlist.id)}>
              <span className="tile-mark">{playlist.name.slice(0, 1)}</span>
              <span>
                <strong>{playlist.name}</strong>
                <p>{playlist.trackIds.length} canciones</p>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const catalog = PLAYLISTS.find((playlist) => playlist.id === focus);
  const owned = userPlaylists.find((playlist) => playlist.id === focus);
  const title = focus === "likes" ? "Me gusta" : (catalog?.name ?? owned?.name ?? "Playlist");
  const description = catalog?.description ?? (focus === "likes" ? "Tus canciones marcadas" : "Creada en este navegador");
  const ids = focus === "likes" ? liked : (catalog?.trackIds ?? owned?.trackIds ?? []);
  const tracks = tracksFrom(ids, known);

  return (
    <div>
      <button type="button" className="back-btn" onClick={() => setFocus(null)}>
        <ArrowLeft />
        Biblioteca
      </button>
      <div className="library-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="row-actions">
          {tracks[0] ? (
            <button type="button" className="solid-btn" onClick={() => void playTrack(tracks[0] as Track, tracks)}>
              Reproducir
            </button>
          ) : null}
          {owned ? (
            <button
              type="button"
              className="danger"
              aria-label="Eliminar playlist"
              onClick={() => {
                deletePlaylist(owned.id);
                setFocus(null);
              }}
            >
              <Trash2 />
            </button>
          ) : null}
        </div>
      </div>
      {tracks.length === 0 ? <p className="note">Todavía no hay canciones aquí.</p> : null}
      <ul className="track-list">
        {tracks.map((track) => (
          <li key={track.id}>
            <div className="track-line glass">
              <button type="button" className="result-row bare" onClick={() => void playTrack(track, tracks)}>
                <img src={artwork(track.id)} alt="" />
                <span>
                  <span className="result-title clamp-2">{track.title}</span>
                  <span className="result-artist">{track.artist}</span>
                </span>
                <span className="result-artist">{formatTime(track.duration)}</span>
              </button>
              {owned ? (
                <button
                  type="button"
                  className="danger"
                  aria-label={`Quitar ${track.title}`}
                  onClick={() => removeTrack(owned.id, track.id)}
                >
                  <Trash2 />
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
