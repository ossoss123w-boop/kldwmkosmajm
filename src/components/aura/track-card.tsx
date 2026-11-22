import { Pause, Play } from "lucide-react";
import { artwork } from "@/lib/media";
import { playTrack, togglePlay } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import type { Track } from "@/lib/types";

export function TrackCard({ track, queue }: { track: Track; queue: Track[] }) {
  const currentId = usePlayer((state) => state.queue[state.index]?.id ?? null);
  const playing = usePlayer((state) => state.playing);
  const isCurrent = currentId === track.id;
  const live = isCurrent && playing;

  return (
    <button
      type="button"
      className={isCurrent ? "track-card glass is-current" : "track-card glass"}
      aria-label={`${live ? "Pausar" : "Reproducir"} ${track.title} de ${track.artist}`}
      onClick={() => {
        if (isCurrent) void togglePlay();
        else void playTrack(track, queue);
      }}
    >
      <span className="cover">
        <img src={artwork(track.id)} alt="" draggable={false} />
        {live ? (
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : null}
        <span className={live ? "play-fab is-pause" : "play-fab"} aria-hidden="true">
          {live ? <Pause /> : <Play />}
        </span>
      </span>
      <span>
        <span className="track-title clamp-2">{track.title}</span>
        <span className="track-artist truncate">{track.artist}</span>
      </span>
    </button>
  );
}
