import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // In live mode with VITE_API_BASE_URL=/api, requests are proxied to the backend (avoids CORS in dev).
      proxy: { '/api': { target: env.DEV_API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
