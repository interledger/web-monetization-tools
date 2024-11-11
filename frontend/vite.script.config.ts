// vite.script.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    build: {
      minify: false,
      lib: {
        entry: './script/index.tsx',  // Entry point for the script file
        formats: ['iife'],  // Use IIFE format (can change based on your needs)
        name: 'InitScript',
        fileName: () => 'init.js',
      },
      outDir: './public',  // Output directory
      emptyOutDir: false,  // Don't clear the directory when building
      rollupOptions: {
        external: [
          //'react-hook-form'
        ],
        output: {
          entryFileNames: 'init.js',  // Name of the output file
         // globals: { 'react-hook-form': 'reactHookForm' }
        }
      },
      watch: isDevelopment ? {} : null, 
    },
    server: {
      watch: {
        usePolling: true, // Ensures file polling for file changes
        ignored: ['node_modules/**', 'public/**'], // Ignore node_modules and output directory
      },
    },
    plugins: [react()],
    define: {
      //'process.env.NODE_ENV': '"'.concat(mode).concat('"'), // Or dynamically: process.env.NODE_ENV
      'process.env.NODE_ENV': '"development"'
    },
  }

});