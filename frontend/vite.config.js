import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/add-case': 'http://localhost:5000',
      '/cases': 'http://localhost:5000',
      '/judges': 'http://localhost:5000',
      '/generate-schedule': 'http://localhost:5000',
      '/simulate-interrupt': 'http://localhost:5000',
      '/dashboard-stats': 'http://localhost:5000',
      '/history': 'http://localhost:5000',
      '/notifications': 'http://localhost:5000',
      '/delete-case': 'http://localhost:5000',
    }
  }
})
