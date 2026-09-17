import { getApiUrl } from "~/config";
import type { Playlist, Song } from "~/db/schema";

// Reutiliza el backend Nitro tal cual (no se migra):
// GET /api/search?query= -> { songs, videos }
// Lanza en error de red/HTTP para que la pantalla distinga
// "sin resultados" (RESULTS vacío) de "fallo" (RESULTS_ERROR).
export async function searchSongs(query: string): Promise<{ songs: Song[]; videos: Song[] }> {
  if (!query) return { songs: [], videos: [] };
  const res = await fetch(getApiUrl(`search?query=${encodeURIComponent(query)}`));
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const result = (await res.json()) as { songs: Song[]; videos: Song[] };
  return {
    songs: (result.songs ?? []).filter(Boolean),
    videos: (result.videos ?? []).filter(Boolean),
  };
}

// GET /api/playlist?list= -> Playlist
export async function getPlaylist(listId: string): Promise<Playlist> {
  const res = await fetch(getApiUrl(`playlist?list=${encodeURIComponent(listId)}`));
  if (!res.ok) throw new Error("Playlist not found");
  return (await res.json()) as Playlist;
}

// GET /api/song?songId= -> Song
export async function getSong(songId: string): Promise<Song> {
  const res = await fetch(getApiUrl(`song?songId=${encodeURIComponent(songId)}`));
  if (!res.ok) throw new Error("Song not found");
  return (await res.json()) as Song;
}
