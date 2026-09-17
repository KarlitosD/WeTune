import { describe, expect, it } from "vitest";
import { Resolution, getThumbnailUrl } from "./thumbnail";

describe("getThumbnailUrl", () => {
  it("usa mqdefault por defecto vía wsrv.nl", () => {
    const url = new URL(getThumbnailUrl("dQw4w9WgXcQ"));
    expect(url.hostname).toBe("wsrv.nl");
    expect(url.searchParams.get("url")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
  });

  it("respeta resolución y medidas", () => {
    const url = new URL(
      getThumbnailUrl("dQw4w9WgXcQ", { resolution: Resolution.Max, w: "512", h: "512", fit: "cover" }),
    );
    expect(url.searchParams.get("url")).toContain("maxresdefault.jpg");
    expect(url.searchParams.get("w")).toBe("512");
    expect(url.searchParams.get("h")).toBe("512");
    expect(url.searchParams.get("fit")).toBe("cover");
  });
});
