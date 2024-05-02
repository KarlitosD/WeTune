import { defineConfig } from 'vite';
import devtools from 'solid-devtools/vite'
import solidPlugin from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
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
        theme_color: "#38bdf8",
        background_color: "#0f172a",
        display: "minimal-ui",
        scope: "/",
        start_url: "/",
        name: "WeTune",
        short_name: "WeTune",
        description: "A music player for the web",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
    })
  ],
});
