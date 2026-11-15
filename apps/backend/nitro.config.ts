import { defineConfig } from "nitro"

// En serverless (Vercel) no hay disco persistente: el cache de /api/song/blob
// (ruta legacy) vive en memoria y se pierde entre invocaciones. En local o en
// un host Node con disco se mantiene fsLite bajo .data/songs_tmp.
const isServerless = process.env.VERCEL === "1" || process.env.NITRO_PRESET === "vercel"

export default defineConfig({
  serverDir: "./server",
  kv: {
    songs: isServerless
      ? { driver: "memory" }
      : { driver: "fsLite", base: "./.data/songs_tmp" },
  },
  // Node 22 es el runtime probado en CI; sin esto Nitro elige la versión más
  // nueva soportada por Vercel.
  vercel: {
    functions: { runtime: "nodejs22.x" },
  },
  compatibilityDate: "2024-12-03",
})
