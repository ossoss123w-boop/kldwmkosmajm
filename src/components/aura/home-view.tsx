import { Play } from "lucide-react";
import { PLAYLISTS, tracksFrom } from "@/lib/catalog";
import { artwork } from "@/lib/media";
import { playTrack } from "@/lib/playback";
import { usePrefs } from "@/lib/prefs";
import type { Track } from "@/lib/types";
import { TrackCard } from "@/components/aura/track-card";

function Rail({ title, tracks }: { title: string; tracks: Track[] }) {
  if (!tracks.length) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Reproducir ${title}`}
          onClick={() => {
            const first = tracks[0];
            if (first) void playTrack(first, tracks);
          }}
        >
          <Play />
        </button>
      </div>
      <div className="rail">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} queue={tracks} />
        ))}
      </div>
    </section>
  );
}

export function HomeView() {
  const recents = usePrefs((state) => state.recents);
  const known = usePrefs((state) => state.known);
  const recentTracks = tracksFrom(recents, known);
  const featuredList = tracksFrom(PLAYLISTS[0]?.trackIds ?? []);
  const featured = featuredList[0];

  return (
    <div>
      {featured ? (
        <button
          type="button"
          className="feature glass"
          onClick={() => void playTrack(featured, featuredList)}
        >
          <img src={artwork(featured.id)} alt="" />
          <span>
            <p className="kicker">En rotación</p>
            <h2>{featured.title}</h2>
            <p>{featured.artist}</p>
          </span>
          <span className="play-btn" aria-hidden="true">
            <Play />
          </span>
        </button>
      ) : null}
      <Rail title="Sigue escuchando" tracks={recentTracks} />
      {PLAYLISTS.map((playlist) => (
        <Rail key={playlist.id} title={playlist.name} tracks={tracksFrom(playlist.trackIds)} />
      ))}
    </div>
  );
}
