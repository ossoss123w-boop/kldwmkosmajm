import { Search, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { usePlayer } from "@/lib/player";
import { CustomizeButton } from "@/components/aura/bg-dialog";
import { Logo } from "@/components/aura/logo";

export function TopBar() {
  const query = usePlayer((state) => state.query);
  const setQuery = usePlayer((state) => state.setQuery);
  const setView = usePlayer((state) => state.setView);

  return (
    <header className="topbar">
      <button type="button" className="brand-lockup" onClick={() => setView("home")}>
        <span className="logo-badge">
          <Logo className="logo-mark" />
        </span>
        <span className="logo-name">{BRAND.name}</span>
      </button>
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setView("search");
        }}
      >
        <label className="search-field glass">
          <Search />
          <input
            type="search"
            value={query}
            placeholder="Buscar canciones, artistas o vídeos"
            aria-label="Buscar"
            onChange={(event) => {
              setQuery(event.target.value);
              setView("search");
            }}
            onFocus={() => setView("search")}
          />
          {query ? (
            <button
              type="button"
              className="clear-btn"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setQuery("");
                setView("home");
              }}
            >
              <X />
            </button>
          ) : null}
        </label>
      </form>
      <CustomizeButton />
    </header>
  );
}
