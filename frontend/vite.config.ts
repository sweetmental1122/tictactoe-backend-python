import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // expose to local network
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // only proxy paths that look like API routes, not source files
        bypass(req) {
          if (req.url && req.url.match(/\.(ts|tsx|js|jsx|css|html)$/)) {
            return req.url;
          }
        },
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
