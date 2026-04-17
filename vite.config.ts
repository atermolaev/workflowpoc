import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  // Отключаем встроенный publicDir — он конфликтует с outDir:'public'
  publicDir: false,
  resolve: {
    alias: {
      '@': srcRoot,
    },
  },
  build: {
    outDir: 'public',
    emptyOutDir: true,
    lib: {
      // Единственная точка входа — preserveModules сам разложит все импорты
      entry: path.resolve(srcRoot, 'main.tsx'),
      formats: ['es'],
      fileName: 'main',
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        '@reduxjs/toolkit',
        '@reduxjs/toolkit/query/react',
        'react-redux',
      ],
      output: {
        preserveModules: true,
        // Обрезает srcRoot из путей → файлы лежат без префикса src/
        preserveModulesRoot: srcRoot,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  server: {
    host: true,
  },
});
