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

  it("filtra nulos y propaga error HTTP", async () => {
    mockFetchOnce({ songs: [song, null], videos: [] });
    const res = await searchSongs("hola");
    expect(res.songs).toHaveLength(1);

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
});
