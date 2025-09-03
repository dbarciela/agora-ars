import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import path from 'path';

export default defineConfig({
  root: path.join(__dirname, 'src', 'client'),
  plugins: [
    svelte({
      // Use the svelte.config.js file
      configFile: './svelte.config.js',
      // Enable hot reload in development
      hot: process.env.NODE_ENV === 'development',
      // Force full reload on changes
      emitCss: true
    }),
  ],
  build: {
    outDir: path.join(__dirname, 'dist', 'client'),
    emptyOutDir: true,
    // Disable minification for easier debugging
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    // Generate sourcemaps for debugging
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.join(__dirname, 'src', 'client', 'index.html'),
        info: path.join(__dirname, 'src', 'client', 'info.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true, // Força o uso da porta 5173, falha se estiver ocupada
    // Fix for Electron dev mode
    hmr: {
      port: 5174
    },
    // Disable file watching issues
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4321',
        changeOrigin: true,
        ws: true,
        secure: false,
        timeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
      },
    },
  },
});
