import { describe, expect, it } from "vitest";
import { resolveAudioUrl, prefetchAudio } from "./audio-source";
import { resolveAudioUrl as mockUrl } from "./audio-source.mock";

describe("audio-source", () => {
  it("rechaza ids inválidos antes de tocar la red", async () => {
    await expect(resolveAudioUrl("corto")).rejects.toThrow("Invalid videoId");
    await expect(prefetchAudio("corto")).resolves.toBeUndefined();
  });

  it("el mock sigue resolviendo una URL reproducible", async () => {
    await expect(mockUrl("dQw4w9WgXcQ")).resolves.toMatch(/^https:\/\//);
  });
});
