import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryResolverPlugin = () => ({
  name: 'entry-resolver-fix',
  enforce: 'pre' as const,
  resolveId(id: string) {
    const cleanId = id.split('?')[0];
    const lower = cleanId.toLowerCase();
    if (
      lower === '/src/main.tsx' ||
      lower === './src/main.tsx' ||
      lower === 'src/main.tsx' ||
      lower === '/src/main.jsx' ||
      lower === './src/main.jsx' ||
      lower === 'src/main.jsx' ||
      lower === '/src/main' ||
      lower === './src/main' ||
      lower === 'src/main' ||
      lower === '/src/index.tsx' ||
      lower === './src/index.tsx' ||
      lower === 'src/index.tsx' ||
      lower.endsWith('/src/main.tsx') ||
      lower.endsWith('/src/main.jsx')
    ) {
      return path.resolve(__dirname, 'src/main.tsx');
    }
    if (cleanId.startsWith('/src/')) {
      return path.resolve(__dirname, cleanId.slice(1));
    }
    if (cleanId.startsWith('./src/')) {
      return path.resolve(__dirname, cleanId.slice(2));
    }
    if (cleanId.startsWith('src/')) {
      return path.resolve(__dirname, cleanId);
    }
    return null;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  root: __dirname,
  plugins: [entryResolverPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/src': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
