import type { Playlist } from "~/db/schema";

export type PlaylistView = "all" | "recent" | "favorites" | "downloaded";

export function sortByRecent(playlists: Playlist[]) {
  // Sort estable: los no escuchados (0) conservan su orden original.
  return [...playlists].sort(
    (a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0),
  );
}

export function filterFavorites(playlists: Playlist[]) {
  return playlists.filter((playlist) => playlist.favorite === true);
}

export function filterDownloaded(
  playlists: Playlist[],
  cachedIds: ReadonlySet<string>,
) {
  return playlists.filter(
    (playlist) =>
      playlist.songs.length > 0 &&
      playlist.songs.every((song) => cachedIds.has(song.youtubeId)),
  );
}

export function applyPlaylistView(
  playlists: Playlist[],
  view: PlaylistView,
  cachedIds?: ReadonlySet<string>,
) {
  switch (view) {
    case "recent":
      return sortByRecent(playlists);
    case "favorites":
      return filterFavorites(playlists);
    case "downloaded":
      return cachedIds ? filterDownloaded(playlists, cachedIds) : [];
    case "all":
    default:
      return playlists;
  }
}
