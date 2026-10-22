import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // STAGING DEFAULT: until VITE_API_MODE=live is set, the app runs on its built-in test data
  // so the deploy opens with zero configuration. To go live set VITE_API_MODE=live
  // (Vercel dashboard variable, or in .env.production) and connect the backend.
  const apiMode = env.VITE_API_MODE === 'live' ? 'live' : 'mock';
  const allowMock = env.VITE_ALLOW_MOCK === 'false' ? 'false' : 'true';
  if (mode === 'production' && apiMode !== 'live') {
    console.warn('\n[konstanpay] STAGING BUILD: running on built-in test data. Set VITE_API_MODE=live before releasing to real users.\n');
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_MODE': JSON.stringify(apiMode),
      'import.meta.env.VITE_ALLOW_MOCK': JSON.stringify(allowMock),
    },
    server: {
      port: 5173,
      // In live mode with VITE_API_BASE_URL=/api, requests are proxied to the backend (avoids CORS in dev).
      proxy: { '/api': { target: env.DEV_API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
