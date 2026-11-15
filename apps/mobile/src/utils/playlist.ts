import type { Playlist } from "~/db/schema";

// Suma las duraciones válidas. Algunos temas viejos pueden venir sin duración
// (0) o con datos inválidos; esos casos no deben romper el total.
export function getPlaylistTotalDuration(playlist: Playlist) {
  return playlist.songs.reduce(
    (total, song) => total + (Number.isFinite(song.duration) ? song.duration : 0),
    0,
  );
}
