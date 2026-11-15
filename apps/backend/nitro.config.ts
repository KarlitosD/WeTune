//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",

  imports: {
    dirs: ["./server/services"]
  },


  storage: {
    songs: {
      driver: "fsLite",
      base: "./.data/songs_tmp"
    }
  },

  esbuild: {
    options: {
      target: "esnext"
    }
  },

  compatibilityDate: "2024-12-03"
});