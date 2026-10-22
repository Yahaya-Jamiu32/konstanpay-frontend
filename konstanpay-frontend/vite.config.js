import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode === 'production' && env.VITE_API_MODE !== 'live') {
    console.warn('\n[konstanpay] STAGING BUILD: running on built-in test data (VITE_API_MODE=' + (env.VITE_API_MODE || 'mock') + '). Do not release to real users.\n');
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // In live mode with VITE_API_BASE_URL=/api, requests are proxied to the backend (avoids CORS in dev).
      proxy: { '/api': { target: env.DEV_API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
