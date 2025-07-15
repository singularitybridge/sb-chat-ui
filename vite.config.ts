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
  define: {
    // Define placeholder values that will be replaced at runtime
    'import.meta.env.VITE_API_URL': JSON.stringify('%VITE_API_URL%'),
    'import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID': JSON.stringify('%VITE_GOOGLE_AUTH_CLIENT_ID%'),
    'import.meta.env.VITE_PUSHER_APP_KEY': JSON.stringify('%VITE_PUSHER_APP_KEY%'),
    'import.meta.env.VITE_PUSHER_CLUSTER': JSON.stringify('%VITE_PUSHER_CLUSTER%'),
  },
});
