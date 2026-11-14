import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlaylist, getSong, searchSongs } from "./client";

const song = {
  title: "Song",
  youtubeId: "dQw4w9WgXcQ",
  thumbnailUrl: "https://x/y.jpg",
  type: "song",
  author: { name: "Author", id: "a1" },
  duration: 200,
};

const originalFetch = globalThis.fetch;

function mockFetchOnce(body: unknown, status = 200) {
  globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("searchSongs", () => {
  it("devuelve vacío sin query y sin llamar a red", async () => {
    const spy = vi.fn();
    globalThis.fetch = spy as typeof fetch;
    expect(await searchSongs("")).toEqual({ songs: [], videos: [] });
    expect(spy).not.toHaveBeenCalled();
  });

  it("filtra nulos/inválidos y propaga error HTTP", async () => {
    mockFetchOnce({ songs: [song, null, { title: "sin id" }], videos: [] });
    const res = await searchSongs("hola");
    expect(res.songs).toEqual([song]);

    mockFetchOnce({ error: "x" }, 500);
    await expect(searchSongs("hola")).rejects.toThrow("Search failed: 500");
  });
});

describe("getPlaylist / getSong", () => {
  it("devuelve el json en OK y lanza en 404", async () => {
    const playlist = { id: "p1", title: "T", songs: [song] };
    mockFetchOnce(playlist);
    expect(await getPlaylist("p1")).toEqual(playlist);

    mockFetchOnce({}, 404);
    await expect(getPlaylist("nope")).rejects.toThrow();
    await expect(getSong("nope")).rejects.toThrow();
  });

  it("descarta canciones inválidas de una playlist", async () => {
    mockFetchOnce({ id: "p1", title: "T", songs: [song, { title: "rota" }] });
    expect(await getPlaylist("p1")).toEqual({ id: "p1", title: "T", songs: [song] });
  });

  it("convierte una respuesta incompleta de /api/song en error amigable", async () => {
    mockFetchOnce({ thumbnailUrl: "https://x/undefined.jpg", type: "video", author: { name: "A", id: "a" } });
    await expect(getSong("V2c3KVGv0X0")).rejects.toThrow("isn't available from YouTube");
  });

  it("mapea el error estructurado del backend", async () => {
    mockFetchOnce({ error: "song_unavailable" }, 422);
    await expect(getSong("V2c3KVGv0X0")).rejects.toThrow("isn't available from YouTube");
  });
});
