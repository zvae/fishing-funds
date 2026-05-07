import path from 'path';
import react from '@vitejs/plugin-react';
import reactSWC from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const prod = command === 'build';

  const alias = {
    '@': path.resolve('src/renderer'),
    '@main': path.resolve('src/main'),
    '@lib': path.resolve('src/lib'),
  };

  return {
    build: {
      outDir: 'release/app/dist/renderer',
      minify: prod,
      cssCodeSplit: false,
      assetsInlineLimit: 1024 * 20,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            return null;
          },
        },
      },
    },
    server: {
      port: 3456,
      strictPort: true,
      proxy: {
        '/ai': {
          target: 'https://generativelanguage.googleapis.com/',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/ai/, ''),
        },
      },
    },
    plugins: [
      prod
        ? react({
            babel: {
              plugins: ['babel-plugin-react-compiler'],
            },
          })
        : reactSWC(),
    ],
    resolve: { alias },
    clearScreen: false,
  };
});