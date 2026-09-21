import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    cors: true,
    // Pinned so the portal stops colliding with the landing site, which also
    // takes Vite's default 5173. FRONTEND_URL must match this in dev.
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2000',
        // target: 'http://102.37.20.178:2000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // Proxying websockets or socket.io:
      // ws://localhost:5173/socket.io
      //   -> ws://localhost:5174/socket.io
      // Exercise caution using `rewriteWsOrigin` as it can leave the
      // proxying open to CSRF attacks.
      '/socket.io': {
        target: 'ws://localhost:2000',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['*'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
});
