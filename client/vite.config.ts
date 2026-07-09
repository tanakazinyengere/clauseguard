import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built bundle loads correctly from
  // capacitor://localhost / androidlocal:// (file-based) contexts on-device,
  // not just from an http(s) origin root.
  base: './',
})
