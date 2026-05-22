import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': 'http://localhost:3001',
      '/api/navigation': 'http://localhost:3001',
      '/api/portal': 'http://localhost:3001',
      '/api/career': 'http://localhost:3001',
    },
  },
})
