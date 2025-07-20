import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Only use proxy for development
    ...(process.env.NODE_ENV === 'development' && {
      proxy: {
        '/api': {
          target: 'https://market-backend-getv.onrender.com',
          changeOrigin: true,
          secure: true
        },
        '/socket.io': {
          target: 'https://market-backend-getv.onrender.com',
          changeOrigin: true,
          secure: true,
          ws: true
        }
      }
    })
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/'
});