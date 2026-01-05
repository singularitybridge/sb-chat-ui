import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ command }) => {
  const commonConfig = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
      },
      fs: {
        strict: false,
      },
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
      strictPort: true,
      host: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      // SPA fallback middleware for dev server
      {
        name: 'spa-fallback',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Skip Vite internal requests (HMR, React Fast Refresh, etc.)
            if (req.url?.startsWith('/@') || req.url?.startsWith('/node_modules/')) {
              return next();
            }

            // Skip API requests
            if (req.url?.startsWith('/api')) {
              return next();
            }

            // Skip source files (src/, public/, etc.)
            if (req.url?.startsWith('/src/') || req.url?.startsWith('/public/') || req.url?.startsWith('/package.json')) {
              return next();
            }

            // Workspace routes should always fallback to index.html (they're virtual routes)
            // Match actual workspace routes like /admin/assistants/{id}/workspace/{path}
            if (req.url?.match(/\/admin\/assistants\/[^/]+\/workspace\//)) {
              req.url = '/index.html';
              return next();
            }

            // For static assets, check if they actually exist
            const hasExtension = /\.[a-zA-Z0-9]+$/.test(req.url || '');
            if (hasExtension && !req.url?.endsWith('.html')) {
              // Let Vite try to serve it as a static asset
              // If it doesn't exist, Vite will handle the 404
              return next();
            }

            // For all other routes without extensions, serve index.html (SPA fallback)
            if (req.url && !hasExtension) {
              req.url = '/index.html';
            }

            next();
          });
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 1000, // Increase the chunk size warning limit to 1MB (adjust as needed)
    },
  };

  if (command === 'build') {
    return {
      ...commonConfig,
      define: {
        // Define placeholder values that will be replaced at runtime
        'import.meta.env.VITE_API_URL': JSON.stringify('%VITE_API_URL%'),
        'import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID': JSON.stringify('%VITE_GOOGLE_AUTH_CLIENT_ID%'),
        'import.meta.env.VITE_PUSHER_APP_KEY': JSON.stringify('%VITE_PUSHER_APP_KEY%'),
        'import.meta.env.VITE_PUSHER_CLUSTER': JSON.stringify('%VITE_PUSHER_CLUSTER%'),
      },
    };
  }

  return commonConfig;
});
