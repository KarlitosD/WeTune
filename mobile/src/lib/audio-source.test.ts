import { describe, expect, it } from "vitest";
import { resolveAudioUrl } from "./audio-source";
import { resolveAudioUrl as mockUrl } from "./audio-source.mock";

describe("audio-source (placeholder)", () => {
  it("rechaza ids inválidos antes del TODO", async () => {
    await expect(resolveAudioUrl("corto")).rejects.toThrow("Invalid videoId");
  });

  it("lanza TODO con id válido hasta la nueva implementación", async () => {
    await expect(resolveAudioUrl("dQw4w9WgXcQ")).rejects.toThrow("[TODO audio]");
  });

  it("el mock resuelve una URL reproducible", async () => {
    await expect(mockUrl("dQw4w9WgXcQ")).resolves.toMatch(/^https:\/\//);
  });
});
