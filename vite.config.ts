import { defineConfig } from 'vite';
import devtools from 'solid-devtools/vite'
import solidPlugin from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

export default defineConfig({
  resolve:{
    alias:{
      '~' : path.resolve(__dirname, './src')
    },
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    devtools({
      autoname: true
    }),
    solidPlugin(), 
    VitePWA({
      base: "/",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "WeTune",
        short_name: "WeTune",
        description: "A music player for the web",
        theme_color: "#38bdf8",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      }, 
    })
  ],
});
