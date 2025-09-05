import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Preprocessors
  preprocess: vitePreprocess(),

  // Compiler options
  compilerOptions: {
    // Enable modern features
    modernAst: true,
    // Use pure Svelte 5 (no compatibility mode)

    // Svelte 5 development options
    dev: process.env.NODE_ENV === 'development',
    // Enable source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // Development options
  onwarn: (warning, handler) => {
    // Handle warnings as needed
    if (warning.code === 'a11y-missing-attribute') return;
    handler(warning);
  },
};
