import { describe, expect, it } from "vitest";
import { createId } from "./id";

describe("createId", () => {
  it("genera ids de 5 chars con el alfabeto esperado", () => {
    for (let i = 0; i < 50; i++) {
      const id = createId();
      expect(id).toMatch(/^[0-9a-z]{5}$/);
    }
  });

  it("no repite en una muestra", () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBeGreaterThan(90);
  });
});
