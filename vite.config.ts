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
      strategies: "generateSW",
      registerType: "autoUpdate",
      base: "/",
      includeAssets: ["icon.svg"],
      manifest: {
        theme_color: "#38bdf8",
        background_color: "#0f172a",
        display: "standalone",
        scope: "/",
        start_url: "/",
        name: "WeTune",
        short_name: "WeTune",
        description: "A music player for the web",
        icons: [
          // {
          //   src: "/icon-192x192.png",
          //   sizes: "192x192",
          //   type: "image/png"
          // },
          // {
          //   src: "/icon-256x256.png",
          //   sizes: "256x256",
          //   type: "image/png"
          // },
          // {
          //   src: "/icon-384x384.png",
          //   sizes: "384x384",
          //   type: "image/png"
          // },
          // {
          //   src: "/icon-512x512.png",
          //   sizes: "512x512",
          //   type: "image/png"
          // },
          {
            "src": "maskable-icon-512x512",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "maskable-icon-192x192",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      },
      workbox: {
        // runtimeCaching: [{
        //   urlPattern: new RegExp('^https://wsrv\\.nl/\\?url=https%3A%2F%2Fi\\.ytimg\\.com%2Fvi%2F.*%2Fmqdefault\\.jpg'),
        //   handler: 'NetworkFirst',
        //   options: {
        //     cacheName: 'yt-thumbnails',
        //     expiration: {
        //       maxEntries: 200,
        //       maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        //       purgeOnQuotaError: true,
        //     },
        //   }
        // }]
      }
    })
  ],
});
