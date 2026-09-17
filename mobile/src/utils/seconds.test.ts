import { describe, expect, it } from "vitest";
import { formatSeconds } from "./seconds";

describe("formatSeconds", () => {
  it("formatea 0 y valores falsy", () => {
    expect(formatSeconds(0)).toBe("0:00");
  });

  it("formatea minutos y segundos con padding", () => {
    expect(formatSeconds(65)).toBe("1:05");
    expect(formatSeconds(61)).toBe("1:01");
    expect(formatSeconds(600)).toBe("10:00");
  });

  it("redondea segundos parciales hacia arriba (paridad con web)", () => {
    expect(formatSeconds(61.2)).toBe("1:02");
  });
});
