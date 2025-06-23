import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
    strictPort: true,
    host: true,
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase the chunk size warning limit to 1MB (adjust as needed)
  },
});
