import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true, 
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Redirects frontend '/api' to backend port 5000
        changeOrigin: true,
      },
    },
  }
})
