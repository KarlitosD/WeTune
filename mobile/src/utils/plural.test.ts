import { describe, expect, it } from "vitest";
import { formatCount } from "./plural";

describe("formatCount", () => {
  it("singular y plural en inglés", () => {
    expect(formatCount(1, "{songs:number} Song{{s}}")).toBe("1 Song");
    expect(formatCount(3, "{songs:number} Song{{s}}")).toBe("3 Songs");
    expect(formatCount(0, "{songs:number} Song{{s}}")).toBe("0 Songs");
  });

  it("singular y plural en español", () => {
    expect(formatCount(1, "{songs:number} Cancion{{es}}")).toBe("1 Cancion");
    expect(formatCount(5, "{songs:number} Cancion{{es}}")).toBe("5 Canciones");
  });
});
