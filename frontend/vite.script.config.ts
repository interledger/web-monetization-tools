// vite.script.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './script/index.ts',  // Entry point for the script file
      formats: ['iife'],  // Use IIFE format (can change based on your needs)
      name: 'InitScript',
      fileName: () => 'init.js',
    },
    outDir: './public',  // Output directory
    emptyOutDir: false,  // Don't clear the directory when building
    rollupOptions: {
      output: {
        entryFileNames: 'init.js',  // Name of the output file
      }
    }
  }
});