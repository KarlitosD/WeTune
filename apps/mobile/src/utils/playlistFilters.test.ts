import { describe, expect, it } from "vitest";
import type { Playlist } from "~/db/schema";
import {
  applyPlaylistView,
  filterDownloaded,
  filterFavorites,
  sortByRecent,
} from "./playlistFilters";

const playlist = (
  id: string,
  options: {
    favorite?: boolean;
    lastPlayedAt?: number;
    songIds?: string[];
  } = {},
): Playlist => ({
  id,
  title: id,
  favorite: options.favorite,
  lastPlayedAt: options.lastPlayedAt,
  songs: (options.songIds ?? []).map((youtubeId) => ({
    title: youtubeId,
    youtubeId,
    thumbnailUrl: "",
    type: "song",
    author: { name: "Artist", id: "artist" },
    duration: 120,
  })),
});

describe("playlist filters", () => {
  it("ordena por última reproducción y deja estables los no escuchados", () => {
    const playlists = [
      playlist("sin-play"),
      playlist("vieja", { lastPlayedAt: 100 }),
      playlist("nueva", { lastPlayedAt: 300 }),
      playlist("media", { lastPlayedAt: 200 }),
    ];

    expect(sortByRecent(playlists).map((p) => p.id)).toEqual([
      "nueva",
      "media",
      "vieja",
      "sin-play",
    ]);
  });

  it("filtra favoritas", () => {
    const playlists = [
      playlist("a", { favorite: true }),
      playlist("b", { favorite: false }),
      playlist("c"),
    ];

    expect(filterFavorites(playlists).map((p) => p.id)).toEqual(["a"]);
  });

  it("solo marca una playlist como descargada si tiene canciones y todas están cacheadas", () => {
    const playlists = [
      playlist("completa", { songIds: ["1", "2"] }),
      playlist("parcial", { songIds: ["1", "3"] }),
      playlist("vacia"),
    ];
    const cached = new Set(["1", "2"]);

    expect(filterDownloaded(playlists, cached).map((p) => p.id)).toEqual(["completa"]);
  });

  it("aplica la vista seleccionada", () => {
    const playlists = [
      playlist("a", { favorite: true, lastPlayedAt: 1 }),
      playlist("b", { lastPlayedAt: 2 }),
    ];

    expect(applyPlaylistView(playlists, "all")).toBe(playlists);
    expect(applyPlaylistView(playlists, "favorites").map((p) => p.id)).toEqual(["a"]);
    expect(applyPlaylistView(playlists, "recent").map((p) => p.id)).toEqual(["b", "a"]);
    expect(applyPlaylistView(playlists, "downloaded", new Set(["1"]))).toEqual([]);
  });
});
