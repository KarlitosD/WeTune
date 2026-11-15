import { describe, expect, it } from "vitest";
import { shareUrlFor, songFromShareParams } from "./share-url";

const song = {
  youtubeId: "dQw4w9WgXcQ",
  title: "Never Gonna Give You Up",
  author: { name: "Rick Astley", id: "UCuAXFkgsw1L7xaCfnd5JJOw" },
  duration: 213,
  type: "video",
};

describe("shareUrlFor", () => {
  it("incluye la metadata para no depender del backend", () => {
    expect(shareUrlFor(song)).toBe(
      "wetune://share/song?songId=dQw4w9WgXcQ&title=Never%20Gonna%20Give%20You%20Up&author=Rick%20Astley&duration=213&type=video",
    );
  });

  it("escapa caracteres especiales del título y el autor", () => {
    const url = shareUrlFor({
      ...song,
      title: "Rock & Roll / 100%",
      author: { ...song.author, name: "AC/DC" },
    });

    expect(url).toContain("title=Rock%20%26%20Roll%20%2F%20100%25");
    expect(url).toContain("author=AC%2FDC");
  });
});

describe("songFromShareParams", () => {
  it("reconstruye la canción desde el link con metadata", () => {
    expect(
      songFromShareParams({
        songId: "dQw4w9WgXcQ",
        title: "Never Gonna Give You Up",
        author: "Rick Astley",
        duration: "213",
        type: "video",
      }),
    ).toEqual({
      youtubeId: "dQw4w9WgXcQ",
      title: "Never Gonna Give You Up",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      duration: 213,
      type: "video",
      author: { name: "Rick Astley", id: "" },
    });
  });

  it("devuelve null para links viejos sin metadata", () => {
    expect(songFromShareParams({ songId: "dQw4w9WgXcQ" })).toBeNull();
  });

  it("tolera duración ausente o inválida", () => {
    expect(
      songFromShareParams({
        songId: "dQw4w9WgXcQ",
        title: "Tema",
        author: "Artista",
        duration: "nope",
      })?.duration,
    ).toBe(0);
  });
});
