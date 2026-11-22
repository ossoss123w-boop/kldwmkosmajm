import type { CatalogPlaylist, Track } from "@/lib/types";

function track(id: string, title: string, artist: string, duration: number): Track {
  return { id, title, artist, duration };
}

/** Catálogo editorial para que Inicio funcione aunque las APIs públicas fallen. */
export const TRACKS: Track[] = [
  track("4NRXx6U8ABQ", "Blinding Lights", "The Weeknd", 200),
  track("H5v3kku4y6Q", "As It Was", "Harry Styles", 167),
  track("mRD0-GxqHVo", "Heat Waves", "Glass Animals", 239),
  track("kTJczUoc26U", "STAY", "The Kid LAROI, Justin Bieber", 141),
  track("TUVcZfQe-Kw", "Levitating", "Dua Lipa", 203),
  track("DyDfgMOUjCI", "bad guy", "Billie Eilish", 194),
  track("34Na4j8AVgA", "Starboy", "The Weeknd", 230),
  track("Pkh8UtuejGw", "Señorita", "Shawn Mendes, Camila Cabello", 191),
  track("dX3k_QDnzHE", "Midnight City", "M83", 243),
  track("bpOSxM0rNPM", "Do I Wanna Know?", "Arctic Monkeys", 272),
  track("sBzrzS1Ag_g", "The Less I Know The Better", "Tame Impala", 216),
  track("MmZexg8sxyk", "Electric Feel", "MGMT", 237),
  track("5NV6Rdv1a3I", "Get Lucky", "Daft Punk", 248),
  track("hT_nvWreIhg", "Counting Stars", "OneRepublic", 257),
  track("6JCLY0Rlx6Q", "Shut Up and Dance", "WALK THE MOON", 199),
  track("OPf0YbXqDm0", "Uptown Funk", "Mark Ronson, Bruno Mars", 270),
  track("fJ9rUzIMcZQ", "Bohemian Rhapsody", "Queen", 355),
  track("Zi_XLOBDo_Y", "Billie Jean", "Michael Jackson", 294),
  track("djV11Xbc914", "Take On Me", "a-ha", 225),
  track("FTQbiNvZqaY", "Africa", "Toto", 295),
  track("hTWKbfoikeg", "Smells Like Teen Spirit", "Nirvana", 301),
  track("yKNxeF4KMsY", "Yellow", "Coldplay", 269),
  track("tAGnKpE4NCI", "Nothing Else Matters", "Metallica", 388),
  track("rYEDA3JcQqw", "Rolling in the Deep", "Adele", 228),
  track("JRfuAukYTKg", "Titanium", "David Guetta, Sia", 245),
  track("60ItHLz5WEA", "Faded", "Alan Walker", 212),
  track("gCYcHz2k5x0", "Animals", "Martin Garrix", 182),
  track("IcrbM1l_BoI", "Wake Me Up", "Avicii", 247),
  track("kOkQ4T5WO9E", "This Is What You Came For", "Calvin Harris, Rihanna", 219),
  track("ru0K8uYEZWw", "Can't Stop the Feeling!", "Justin Timberlake", 237),
  track("ktvTqknDobU", "Radioactive", "Imagine Dragons", 186),
  track("nfWlot6h_JM", "Shake It Off", "Taylor Swift", 219),
  track("Rht7rBHuXW8", "MALAMENTE", "ROSALÍA", 169),
  track("Cr8K88UcO0s", "Tití Me Preguntó", "Bad Bunny", 291),
  track("QlZNGcVfeF0", "Columbia", "Quevedo", 206),
  track("qYXCsZunjRM", "Lo Malo", "Aitana, Ana Guerra", 192),
  track("Qz9gmiLBVFA", "Tacones Rojos", "Sebastián Yatra", 204),
  track("jZGpkLElSu8", "TQG", "KAROL G, Shakira", 217),
  track("CFPLIaMpGrY", "Todo De Ti", "Rauw Alejandro", 212),
  track("ZlFri4ez_lE", "Demasiadas Mujeres", "C. Tangana", 168),
  track("hLQl3WQQoQ0", "Someone Like You", "Adele", 285),
  track("YQHsXMglC9A", "Hello", "Adele", 295),
  track("450p7goxZqg", "All of Me", "John Legend", 270),
  track("2Vv-BfVoq4g", "Perfect", "Ed Sheeran", 263),
  track("lp-EO5I60KA", "Thinking Out Loud", "Ed Sheeran", 281),
  track("lWA2pjMjpBs", "Diamonds", "Rihanna", 225),
  track("e-ORhEE9VVg", "Blank Space", "Taylor Swift", 231),
  track("JGwWNGJdvx8", "Shape of You", "Ed Sheeran", 233),
  track("8UVNT4wvIGY", "Somebody That I Used To Know", "Gotye, Kimbra", 244),
];

export const CATALOG_BY_ID: Record<string, Track> = Object.fromEntries(TRACKS.map((item) => [item.id, item]));

export const PLAYLISTS: CatalogPlaylist[] = [
  {
    id: "tendencias",
    name: "Tendencias",
    description: "Lo que más suena ahora",
    trackIds: ["4NRXx6U8ABQ", "H5v3kku4y6Q", "mRD0-GxqHVo", "kTJczUoc26U", "TUVcZfQe-Kw", "DyDfgMOUjCI", "34Na4j8AVgA", "Pkh8UtuejGw"],
  },
  {
    id: "recomendados",
    name: "Recomendados",
    description: "Una selección con pulso propio",
    trackIds: ["dX3k_QDnzHE", "bpOSxM0rNPM", "sBzrzS1Ag_g", "MmZexg8sxyk", "5NV6Rdv1a3I", "hT_nvWreIhg", "6JCLY0Rlx6Q", "OPf0YbXqDm0"],
  },
  {
    id: "espanol",
    name: "En español",
    description: "Voces de este lado del mapa",
    trackIds: ["Rht7rBHuXW8", "Cr8K88UcO0s", "QlZNGcVfeF0", "qYXCsZunjRM", "Qz9gmiLBVFA", "jZGpkLElSu8", "CFPLIaMpGrY", "ZlFri4ez_lE"],
  },
  {
    id: "pulso",
    name: "Pulso",
    description: "Para subir el volumen",
    trackIds: ["JRfuAukYTKg", "60ItHLz5WEA", "gCYcHz2k5x0", "IcrbM1l_BoI", "kOkQ4T5WO9E", "ru0K8uYEZWw", "ktvTqknDobU", "nfWlot6h_JM"],
  },
  {
    id: "clasicos",
    name: "Clásicos",
    description: "Piezas que no envejecen",
    trackIds: ["fJ9rUzIMcZQ", "Zi_XLOBDo_Y", "djV11Xbc914", "FTQbiNvZqaY", "hTWKbfoikeg", "yKNxeF4KMsY", "tAGnKpE4NCI", "rYEDA3JcQqw"],
  },
  {
    id: "nocturna",
    name: "Aura nocturna",
    description: "Cuando baja la luz",
    trackIds: ["hLQl3WQQoQ0", "YQHsXMglC9A", "450p7goxZqg", "2Vv-BfVoq4g", "lp-EO5I60KA", "lWA2pjMjpBs", "e-ORhEE9VVg", "JGwWNGJdvx8", "8UVNT4wvIGY"],
  },
];

export function tracksFrom(ids: string[], known: Record<string, Track> = {}) {
  const found: Track[] = [];
  for (const id of ids) {
    const item = CATALOG_BY_ID[id] ?? known[id];
    if (item) found.push(item);
  }
  return found;
}

export function resolveTrack(id: string, known: Record<string, Track>) {
  return CATALOG_BY_ID[id] ?? known[id];
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function searchCatalog(query: string) {
  const needle = fold(query.trim());
  if (needle.length < 2) return [];
  return TRACKS.filter((item) => fold(`${item.title} ${item.artist}`).includes(needle)).slice(0, 20);
}
