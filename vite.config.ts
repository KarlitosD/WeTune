import { defineConfig } from 'vite';
import devtools from 'solid-devtools/vite'
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite'
import path from "path"

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: 'es2022',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  plugins: [
    devtools({
      autoname: true
    }),
    solidPlugin(),
    tailwindcss()
  ],

  server: {
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
  }
});
