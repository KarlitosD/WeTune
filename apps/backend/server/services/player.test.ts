import { describe, expect, it } from "vitest"
import { downloadYoutubeAudio } from "./player"

describe("downloadYoutubeAudio", () => {
  it("rechaza un id demasiado corto sin hacer red", async () => {
    await expect(downloadYoutubeAudio("corto")).rejects.toThrow("Invalid videoId")
  })

  it("rechaza caracteres inválidos en el id", async () => {
    await expect(downloadYoutubeAudio("w7GgAvVy6-M!")).rejects.toThrow("Invalid videoId")
  })
})
