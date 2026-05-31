import { defineConfig } from 'vite'
import viteGLSL from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteGLSL()
  ],
})
