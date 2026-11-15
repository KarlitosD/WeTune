import { describe, expect, it } from "vitest"
import { specificParseCookiesYT } from "./cookies"

describe("specificParseCookiesYT", () => {
  it("separa nombre y valor de cada cookie", () => {
    const cookies = specificParseCookiesYT("GPS=1; YSC=abc")

    expect(cookies).toEqual([
      { name: "GPS", value: "1", domain: ".youtube.com", path: "/" },
      { name: "YSC", value: "abc", domain: ".youtube.com", path: "/" },
    ])
  })

  it("conserva los '=' dentro del valor", () => {
    const cookies = specificParseCookiesYT("TOKEN=a=b=c")

    expect(cookies[0]).toEqual({
      name: "TOKEN",
      value: "a=b=c",
      domain: ".youtube.com",
      path: "/",
    })
  })

  it("ignora espacios alrededor del nombre", () => {
    const cookies = specificParseCookiesYT("  SID = valor  ")

    expect(cookies[0].name).toBe("SID")
    expect(cookies[0].value).toBe("valor")
  })
})
