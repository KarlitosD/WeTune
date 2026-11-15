import { describe, expect, it } from "vitest";
import { shareUrlFor } from "./share-url";

describe("shareUrlFor", () => {
  it("usa el scheme propio para abrir la app", () => {
    expect(shareUrlFor({ youtubeId: "dQw4w9WgXcQ" })).toBe(
      "wetune://share/song?songId=dQw4w9WgXcQ",
    );
  });
});
