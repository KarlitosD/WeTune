import { describe, expect, it } from "vitest";
import { getSong } from "./client";

// Requiere el backend local y EXPO_PUBLIC_API_URL apuntando a él:
//   EXPO_PUBLIC_API_URL=http://localhost:3010 API_INTEGRATION=1 \
//     npx vitest run src/api/client.integration.test.ts
const run = process.env.API_INTEGRATION === "1";
const suite = run ? describe : describe.skip;

suite("api integration", () => {
  it("parsea una respuesta completa de /api/song", async () => {
    const song = await getSong("V2c3KVGv0X0");
    expect(song.youtubeId).toBe("V2c3KVGv0X0");
    expect(song.title).toBe("Tested And True");
    expect(song.duration).toBeGreaterThan(0);
  });

  it("convierte song_unavailable en un error amigable", async () => {
    await expect(getSong("AAAAAAAAAAA")).rejects.toThrow("isn't available from YouTube");
  });
});
