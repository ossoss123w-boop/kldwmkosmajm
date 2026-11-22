import { useEffect } from "react";
import { House, Library, Search } from "lucide-react";
import { next, prev, togglePlay } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { applyVolume, preloadApi } from "@/lib/youtube";
import { Backdrop } from "@/components/aura/backdrop";
import { HomeView } from "@/components/aura/home-view";
import { LibraryView } from "@/components/aura/library-view";
import { PlayerBar } from "@/components/aura/player-bar";
import { SearchView } from "@/components/aura/search-view";
import { Sidebar } from "@/components/aura/sidebar";
import { TopBar } from "@/components/aura/topbar";

const TABS = [
  { id: "home" as const, label: "Inicio", icon: House },
  { id: "search" as const, label: "Buscar", icon: Search },
  { id: "library" as const, label: "Biblioteca", icon: Library },
];

export function Shell() {
  const view = usePlayer((state) => state.view);
  const setView = usePlayer((state) => state.setView);

  useEffect(() => {
    const apply = () => {
      const { volume, muted } = usePrefs.getState();
      applyVolume(muted ? 0 : volume);
    };
    void usePrefs.persist.rehydrate();
    const kick = () => {
      void preloadApi().catch(() => undefined);
    };
    window.addEventListener("pointerdown", kick, { once: true });
    const unsub = usePrefs.persist.onFinishHydration(apply);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button, a")) return;
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      } else if (event.code === "ArrowRight" && event.shiftKey) {
        void next();
      } else if (event.code === "ArrowLeft" && event.shiftKey) {
        void prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", onKey);
      unsub();
    };
  }, []);

  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <Backdrop />
      <div className="app-shell">
        <Sidebar />
        <main className="main-panel" id="contenido">
          <TopBar />
          <div className="main-scroll">
            {view === "home" ? <HomeView /> : null}
            {view === "search" ? <SearchView /> : null}
            {view === "library" ? <LibraryView /> : null}
          </div>
        </main>
        <PlayerBar />
        <nav className="tab-bar glass" aria-label="Navegación">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setView(tab.id)}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
