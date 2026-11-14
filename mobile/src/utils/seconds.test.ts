import { describe, expect, it } from "vitest";
import { formatSeconds, formatTotalDuration } from "./seconds";

describe("formatSeconds", () => {
  it("formatea 0 y valores falsy", () => {
    expect(formatSeconds(0)).toBe("0:00");
  });

  it("formatea minutos y segundos con padding", () => {
    expect(formatSeconds(65)).toBe("1:05");
    expect(formatSeconds(61)).toBe("1:01");
    expect(formatSeconds(600)).toBe("10:00");
  });

  it("redondea segundos parciales hacia arriba", () => {
    expect(formatSeconds(61.2)).toBe("1:02");
  });
});

describe("formatTotalDuration", () => {
  it("devuelve vacío si no hay duración", () => {
    expect(formatTotalDuration(0)).toBe("");
    expect(formatTotalDuration(-1)).toBe("");
  });

  it("formatea segundos y minutos", () => {
    expect(formatTotalDuration(59)).toBe("59 s");
    expect(formatTotalDuration(60)).toBe("1 min");
    expect(formatTotalDuration(3599)).toBe("1 h");
    expect(formatTotalDuration(6120)).toBe("1 h 42 min");
  });
});
