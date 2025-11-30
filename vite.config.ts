import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@src', replacement: path.resolve(__dirname, 'src') },
      { find: '@parser', replacement: path.resolve(__dirname, 'src/parser') },
      { find: '@DocumentParser', replacement: path.resolve(__dirname, 'src/parser/DocumentParser') },
      { find: '@PdfParser', replacement: path.resolve(__dirname, 'src/parser/PdfParser') },
      { find: '@math', replacement: path.resolve(__dirname, 'src/types/common/math') },
    ],
  },
  server: {
    port: 6673,
    open: true,
  },
  preview: {
    port: 6673,
  },
});
