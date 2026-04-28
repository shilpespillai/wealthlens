
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info', // Show startup logs and warnings
  plugins: [
    react(),
    {
      name: 'dev-auth-injector',
      apply: 'serve', // ONLY applies during local development (npm run dev)
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            injectTo: 'head',
            children: `
              // WealthLens Local Testing Bypass
              // This script is injected only during "npm run dev" to avoid re-logging in
              // It is physically stripped from production builds.
              (function() {
                if (!localStorage.getItem('mockUser')) {
                  const devUser = {
                    id: 'usr-dev-tester',
                    email: 'tester@wealthlens.info',
                    full_name: 'Dev Tester',
                    provider: 'google'
                  };
                  localStorage.setItem('mockUser', JSON.stringify(devUser));
                  console.log('%c[WealthLens Dev] Set temporary dev session: ' + devUser.email, 'background: #4f46e5; color: #fff; padding: 2px 4px; border-radius: 4px;');
                }
              })();
            `
          }
        ];
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});