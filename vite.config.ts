import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devApiPlugin } from './scripts/dev-api';

export default defineConfig(() => {
    return {
      server: {
        // Loopback only: the dev server runs the API with local credentials,
        // and macOS AirPlay Receiver already holds *:5000. Run
        // `npm run dev -- --host 0.0.0.0` to reach it from another device.
        host: '127.0.0.1',
        port: 5000,
        // Fail instead of drifting to another port; OAuth callbacks and the
        // docs assume this one.
        strictPort: true,
        allowedHosts: true as const,
      },
      build: {
        outDir: 'dist/public',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'query-vendor': ['@tanstack/react-query'],
              'motion-vendor': ['framer-motion'],
              'charts': ['recharts'],
              'ui': ['lucide-react'],
            }
          }
        }
      },
      plugins: [react(), devApiPlugin()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@shared': path.resolve(__dirname, './shared'),
          'react': path.resolve(__dirname, './node_modules/react'),
          'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        }
      }
    };
});
