// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  base: '/',
  server: {
    strictPort: true,  
    proxy: {
      '/api': {
        target: 'https://lktool.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
});
