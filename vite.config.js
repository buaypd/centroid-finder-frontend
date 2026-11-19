import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, Vite serves the React app and forwards API calls to the
// Express server, so the browser sees one origin (no CORS, and canvas can
// read video pixels without being "tainted").
const SERVER = 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': SERVER,
      '/thumbnail': SERVER,
      '/process': SERVER,
      // Only proxy video *files* (/videos/name.mp4). A bare /videos is the
      // React route, so it must fall through to index.html.
      '^/videos/.+': SERVER,
      '/results': SERVER,
    },
  },
  test: {
    environment: 'node',
  },
});
