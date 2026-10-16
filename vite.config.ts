import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIRTUAL_ENTRY_ID = '\0virtual:entry-main.tsx';

const entryResolverPlugin = () => ({
  name: 'bulletproof-entry-resolver',
  enforce: 'pre' as const,
  resolveId(id: string) {
    const cleanId = id.split('?')[0];
    const lower = cleanId.toLowerCase();

    // Check if the requested id is the application entry script
    const isEntryRequest =
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
      lower === '/src/index' ||
      lower === './src/index' ||
      lower === 'src/index' ||
      lower.endsWith('/src/main.tsx') ||
      lower.endsWith('/src/main.jsx') ||
      lower.endsWith('/src/index.tsx');

    if (isEntryRequest) {
      const candidates = [
        path.resolve(__dirname, 'src/main.tsx'),
        path.resolve(__dirname, 'src/Main.tsx'),
        path.resolve(__dirname, 'src/main.jsx'),
        path.resolve(__dirname, 'src/Main.jsx'),
        path.resolve(__dirname, 'src/index.tsx'),
        path.resolve(__dirname, 'src/Index.tsx'),
        path.resolve(__dirname, 'src/index.jsx'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      // If no file exists on disk (e.g. Git ignored or omitted entry file on Linux), fallback to virtual entry
      return VIRTUAL_ENTRY_ID;
    }

    if (cleanId.startsWith('/src/')) {
      const target = path.resolve(__dirname, cleanId.slice(1));
      if (fs.existsSync(target)) return target;
    }
    if (cleanId.startsWith('./src/')) {
      const target = path.resolve(__dirname, cleanId.slice(2));
      if (fs.existsSync(target)) return target;
    }
    if (cleanId.startsWith('src/')) {
      const target = path.resolve(__dirname, cleanId);
      if (fs.existsSync(target)) return target;
    }

    return null;
  },

  load(id: string) {
    if (id === VIRTUAL_ENTRY_ID) {
      return `
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import App from './src/App';
        import './src/index.css';

        const rootEl = document.getElementById('root');
        if (rootEl) {
          ReactDOM.createRoot(rootEl).render(
            React.createElement(React.StrictMode, null, React.createElement(App))
          );
        }
      `;
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
