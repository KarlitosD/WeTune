import { defineConfig } from "nitro"

export default defineConfig({
  serverDir: "./server",
  kv: {
    songs: {
      driver: "fsLite",
      base: "./.data/songs_tmp",
    },
  },
  compatibilityDate: "2024-12-03",
})
