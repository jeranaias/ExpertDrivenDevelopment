// Module 5 — Vite proxy is the magic that lets the React dev server (port 5173)
// talk to the Go backend (port 8080) without a CORS dance.
// Module 8 — `changeOrigin` keeps the role cookie scoped correctly.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
