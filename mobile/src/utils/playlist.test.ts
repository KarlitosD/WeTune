import { describe, expect, it } from "vitest";
import type { Playlist } from "~/db/schema";
import { getPlaylistTotalDuration } from "./playlist";

const playlist = (durations: number[]): Playlist => ({
  id: "test",
  title: "Test",
  songs: durations.map((duration, index) => ({
    title: `Song ${index}`,
    youtubeId: `id-${index}`,
    thumbnailUrl: "",
    type: "video",
    author: { name: "Artist", id: "artist" },
    duration,
  })),
});

describe("getPlaylistTotalDuration", () => {
  it("suma las duraciones de la playlist", () => {
    expect(getPlaylistTotalDuration(playlist([215, 240, 60]))).toBe(515);
  });

  it("devuelve 0 para una playlist vacía", () => {
    expect(getPlaylistTotalDuration(playlist([]))).toBe(0);
  });

  it("ignora duraciones inválidas", () => {
    expect(getPlaylistTotalDuration(playlist([120, Number.NaN, Number.POSITIVE_INFINITY]))).toBe(120);
  });
});
