import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5173,
    strictPort: true,
  },

  // Use relative paths for production build (Tauri embeds files)
  base: './',

  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS/Linux
    target: process.env.TAURI_PLATFORM === 'windows'
      ? 'chrome105'
      : 'safari13',
    // Don't minify when debugging
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Source maps for debugging
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
