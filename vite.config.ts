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
  plugins: [
    devtools({
      autoname: true
    }),
    solidPlugin(), 
    VitePWA()
  ],
  build: {
    target: 'esnext',
  },
});
