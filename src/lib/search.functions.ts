import { createServerFn } from "@tanstack/react-start";
import { runSearch } from "@/lib/search-upstream";

export const searchTracks = createServerFn({ method: "GET" })
  .validator((data: { q: string }) => {
    const q = typeof data?.q === "string" ? data.q.trim().slice(0, 120) : "";
    if (q.length < 2) throw new Error("Escribe al menos 2 caracteres");
    return { q };
  })
  .handler(async ({ data }) => runSearch(data.q));
