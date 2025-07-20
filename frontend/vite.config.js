import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Change from 3000 to 5173 (Vite default)
    open: true,
    proxy: {
      '/api': {
        target: 'https://market-backend-getv.onrender.com', // Use your deployed backend
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
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/'
});