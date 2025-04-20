// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // this is the publish directory in Render
  },
  server: {
    port: 3000, // optional: sets local dev port
  },
});
