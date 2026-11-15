import { describe, expect, it } from "vitest";
import { createYoutubeClient, downloadAudio, probeAudio } from "./youtube";

// Test manual contra YouTube real (no corre en CI):
//   YOUTUBE_INTEGRATION=1 npx vitest run src/lib/youtube.integration.test.ts
const run = process.env.YOUTUBE_INTEGRATION === "1";
const suite = run ? describe : describe.skip;

suite("youtube integration", () => {
  it(
    "resuelve una URL googlevideo y valida el probe",
    async () => {
      const client = createYoutubeClient();
      const source = await client.resolve("dQw4w9WgXcQ", "lowest");
      expect(source.url).toMatch(/^https:\/\/.*googlevideo\.com/);
      expect(source.mimeType).toMatch(/^audio\//);
      const probe = await probeAudio(source);
      expect(probe.total).toBeGreaterThan(0);
    },
    60_000,
  );

  it(
    "descarga completa con chunks validados",
    async () => {
      const client = createYoutubeClient();
      const source = await client.resolve("dQw4w9WgXcQ", "lowest");
      let received = 0;
      const total = await downloadAudio(source, {
        onChunk: (bytes) => {
          received += bytes.length;
        },
      });
      expect(total).toBeGreaterThan(100_000);
      expect(received).toBe(total);
    },
    120_000,
  );
});
