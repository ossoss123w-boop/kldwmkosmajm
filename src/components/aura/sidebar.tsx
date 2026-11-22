import { House, Library, Play, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PLAYLISTS, tracksFrom } from "@/lib/catalog";
import { playTrack } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { Logo } from "@/components/aura/logo";

const NAV = [
  { id: "home" as const, label: "Inicio", icon: House },
  { id: "search" as const, label: "Buscar", icon: Search },
  { id: "library" as const, label: "Tu biblioteca", icon: Library },
];

export function Sidebar() {
  const view = usePlayer((state) => state.view);
  const setView = usePlayer((state) => state.setView);
  const focus = usePlayer((state) => state.libraryFocus);
  const setFocus = usePlayer((state) => state.setLibraryFocus);
  const liked = usePrefs((state) => state.liked);
  const known = usePrefs((state) => state.known);
  const userPlaylists = usePrefs((state) => state.userPlaylists);

  return (
    <aside className="side glass">
      <button
        type="button"
        className="logo-row"
        onClick={() => {
          setFocus(null);
          setView("home");
        }}
      >
        <span className="logo-badge">
          <Logo className="logo-mark" />
        </span>
        <span className="logo-name">{BRAND.name}</span>
      </button>
      <nav className="nav-block" aria-label="Principal">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={active ? "nav-item is-active" : "nav-item"}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (item.id === "library") setFocus(null);
                setView(item.id);
              }}
            >
              <Icon />
              {item.label}
            </button>
          );
        })}
      </nav>
      <p className="side-label">Playlists</p>
      <div className="side-scroll">
        <PlaylistRow
          name="Me gusta"
          active={view === "library" && focus === "likes"}
          onOpen={() => {
            setFocus("likes");
            setView("library");
          }}
          onPlay={() => {
            const tracks = tracksFrom(liked, known);
            const first = tracks[0];
            if (first) void playTrack(first, tracks);
          }}
        />
        {PLAYLISTS.map((playlist) => (
          <PlaylistRow
            key={playlist.id}
            name={playlist.name}
            active={view === "library" && focus === playlist.id}
            onOpen={() => {
              setFocus(playlist.id);
              setView("library");
            }}
            onPlay={() => {
              const tracks = tracksFrom(playlist.trackIds);
              const first = tracks[0];
              if (first) void playTrack(first, tracks);
            }}
          />
        ))}
        {userPlaylists.map((playlist) => (
          <PlaylistRow
            key={playlist.id}
            name={playlist.name}
            active={view === "library" && focus === playlist.id}
            onOpen={() => {
              setFocus(playlist.id);
              setView("library");
            }}
            onPlay={() => {
              const tracks = tracksFrom(playlist.trackIds, known);
              const first = tracks[0];
              if (first) void playTrack(first, tracks);
            }}
          />
        ))}
      </div>
    </aside>
  );
}

function PlaylistRow({
  name,
  active,
  onOpen,
  onPlay,
}: {
  name: string;
  active: boolean;
  onOpen: () => void;
  onPlay: () => void;
}) {
  return (
    <div className={active ? "plist is-active" : "plist"}>
      <button type="button" className="plist-name" onClick={onOpen}>
        {name}
      </button>
      <button type="button" className="plist-play" aria-label={`Reproducir ${name}`} onClick={onPlay}>
        <Play />
      </button>
    </div>
  );
}
