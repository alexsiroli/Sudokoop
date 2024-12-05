import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Proxy per il server Socket.IO (WebSocket)
      '/socket.io': {
        target: 'http://localhost:5000', // Porta del tuo server Node.js
        changeOrigin: true,
        ws: true, // Abilita il WebSocket
      },
    },
  },
})
