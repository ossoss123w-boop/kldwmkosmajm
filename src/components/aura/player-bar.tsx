import { useEffect, useState } from "react";
import {
  Heart,
  ListPlus,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { artwork, formatTime } from "@/lib/media";
import {
  cycleRepeat,
  next,
  prev,
  seek,
  setVolume,
  toggleMute,
  togglePlay,
  toggleShuffle,
} from "@/lib/playback";
import { useCurrentTrack, usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";

export function PlayerBar() {
  const track = useCurrentTrack();
  const playing = usePlayer((state) => state.playing);
  const shuffle = usePlayer((state) => state.shuffle);
  const repeat = usePlayer((state) => state.repeat);
  const error = usePlayer((state) => state.error);
  const liked = usePrefs((state) => (track ? state.liked.includes(track.id) : false));
  const toggleLike = usePrefs((state) => state.toggleLike);
  const volume = usePrefs((state) => state.volume);
  const muted = usePrefs((state) => state.muted);
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <footer className="player-bar glass">
      <div className="player-grid">
        <div className="player-meta">
          {track ? <img src={artwork(track.id)} alt="" /> : <span className="cover-fallback" />}
          <div className="player-copy">
            <strong>{track ? track.title : "Elige una canción"}</strong>
            <span>{track ? track.artist : BRAND.tagline}</span>
            {error ? <p className="player-error">{error}</p> : null}
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label={liked ? "Quitar de me gusta" : "Me gusta"}
            aria-pressed={liked}
            disabled={!track}
            onClick={() => {
              if (track) toggleLike(track);
            }}
          >
            <Heart className={liked ? "is-fill" : undefined} />
          </button>
          <SaveButton />
        </div>
        <div className="player-center">
          <div className="transport">
            <button type="button" className="icon-btn" aria-label="Aleatorio" aria-pressed={shuffle} onClick={toggleShuffle}>
              <Shuffle />
            </button>
            <button type="button" className="icon-btn" aria-label="Anterior" disabled={!track} onClick={() => void prev()}>
              <SkipBack />
            </button>
            <button
              type="button"
              className="play-btn"
              aria-label={playing ? "Pausar" : "Reproducir"}
              disabled={!track}
              onClick={() => void togglePlay()}
            >
              {playing ? <Pause /> : <Play />}
            </button>
            <button type="button" className="icon-btn" aria-label="Siguiente" disabled={!track} onClick={() => void next()}>
              <SkipForward />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={repeat === "one" ? "Repetir una" : repeat === "all" ? "Repetir todo" : "Repetir"}
              aria-pressed={repeat !== "off"}
              onClick={cycleRepeat}
            >
              <RepeatIcon />
            </button>
          </div>
          <Progress />
        </div>
        <div className="player-vol">
          <button
            type="button"
            className="icon-btn"
            aria-label={muted || volume === 0 ? "Activar sonido" : "Silenciar"}
            onClick={toggleMute}
          >
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>
          <input
            className="range"
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            aria-label="Volumen"
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${muted ? 0 : volume}%, color-mix(in oklab, var(--color-fg) 22%, transparent) ${muted ? 0 : volume}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
}

function Progress() {
  const progress = usePlayer((state) => state.progress);
  const duration = usePlayer((state) => state.duration);
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? progress;
  const max = duration > 0 ? duration : 0;
  const pct = max > 0 ? Math.min(100, (shown / max) * 100) : 0;

  return (
    <div className="progress">
      <span>{formatTime(shown)}</span>
      <input
        className="range"
        type="range"
        min={0}
        max={max || 0}
        step={0.1}
        value={max ? Math.min(shown, max) : 0}
        aria-label="Progreso"
        disabled={!max}
        onChange={(event) => setDrag(Number(event.target.value))}
        onPointerUp={() => {
          if (drag != null) seek(drag);
          setDrag(null);
        }}
        onKeyUp={() => {
          if (drag != null) seek(drag);
          setDrag(null);
        }}
        onBlur={() => setDrag(null)}
        style={{
          background: `linear-gradient(to right, var(--color-accent) ${pct}%, color-mix(in oklab, var(--color-fg) 22%, transparent) ${pct}%)`,
        }}
      />
      <span>{formatTime(max)}</span>
    </div>
  );
}

function SaveButton() {
  const track = useCurrentTrack();
  const playlists = usePrefs((state) => state.userPlaylists);
  const addTrack = usePrefs((state) => state.addTrack);
  const createPlaylist = usePrefs((state) => state.createPlaylist);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (!track) {
    return (
      <button type="button" className="icon-btn" aria-label="Añadir a playlist" disabled>
        <ListPlus />
      </button>
    );
  }

  return (
    <div className="save-wrap" onPointerDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Añadir a playlist"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ListPlus />
      </button>
      {open ? (
        <div className="save-menu glass" role="menu">
          {playlists.length === 0 ? <p className="note">Aún no tienes playlists.</p> : null}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              role="menuitem"
              onClick={() => {
                addTrack(playlist.id, track);
                setOpen(false);
              }}
            >
              {playlist.trackIds.includes(track.id) ? "Ya está en " : "Añadir a "}
              {playlist.name}
            </button>
          ))}
          <form
            className="menu-create"
            onSubmit={(event) => {
              event.preventDefault();
              const id = createPlaylist(name);
              if (!id) return;
              addTrack(id, track);
              setName("");
              setOpen(false);
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nueva playlist"
              aria-label="Nueva playlist"
              maxLength={40}
            />
          </form>
        </div>
      ) : null}
    </div>
  );
}
