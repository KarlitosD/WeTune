import { describe, expect, it } from "vitest";
import { TypeCompiler } from "@sinclair/typebox/compiler";
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
    expect(TypeCompiler.Compile(songSchema).Check(song)).toBe(true);
    expect(TypeCompiler.Compile(playlistSchema).Check({ id: "p1", title: "T", songs: [song] })).toBe(true);
  });

  it("rechaza Song sin youtubeId", () => {
    const { youtubeId: _dropped, ...rest } = song;
    expect(TypeCompiler.Compile(songSchema).Check(rest)).toBe(false);
  });
});
