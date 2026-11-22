export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number;
};

export type CatalogPlaylist = {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
};

export type UserPlaylist = {
  id: string;
  name: string;
  trackIds: string[];
};

export type SceneId = "bruma" | "nocturno" | "brasa" | "niebla" | "marea" | "image";

export type RepeatMode = "off" | "all" | "one";

export type AppView = "home" | "search" | "library";

export type SearchSource = "invidious" | "piped" | "local";

export type SearchResponse = {
  results: Track[];
  source: SearchSource;
  warning?: string;
};
