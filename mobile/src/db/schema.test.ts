import { describe, expect, it } from "vitest";
import { playlistSchema, songSchema } from "./schema";

// Guarda contra drift con el backend: la forma que devuelve Nitro debe validar.
const song = {
  title: "Song",
  youtubeId: "dQw4w9WgXcQ",
  thumbnailUrl: "https://x/y.jpg",
  type: "song",
  author: { name: "Author", id: "a1" },
  duration: 200,
};

describe("schema", () => {
  it("acepta Song y Playlist válidos", () => {
    expect(songSchema.safeParse(song).success).toBe(true);
    expect(playlistSchema.safeParse({ id: "p1", title: "T", songs: [song] }).success).toBe(true);
  });

  it("rechaza Song sin youtubeId", () => {
    const { youtubeId: _dropped, ...rest } = song;
    expect(songSchema.safeParse(rest).success).toBe(false);
  });
});
