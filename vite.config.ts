import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryResolverPlugin = () => ({
  name: 'entry-resolver-fix',
  resolveId(id: string) {
    const cleanId = id.split('?')[0];
    if (
      cleanId === '/src/main.tsx' ||
      cleanId === './src/main.tsx' ||
      cleanId === 'src/main.tsx' ||
      cleanId === '/src/main' ||
      cleanId === './src/main' ||
      cleanId === 'src/main'
    ) {
      return path.resolve(__dirname, 'src/main.tsx');
    }
    return null;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [entryResolverPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/src': path.resolve(__dirname, './src'),
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
