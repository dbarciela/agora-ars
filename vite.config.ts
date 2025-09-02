import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.join(__dirname, 'src', 'client'),
  build: {
    outDir: path.join(__dirname, 'dist', 'client'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src', 'client', 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4321',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:4321',
      },
    },
  },
});
