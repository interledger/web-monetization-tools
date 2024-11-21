// vite.script.config.ts
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    build: {
      lib: {
        entry: './script/index.ts', // Entry point for the script file
        formats: ['iife'], // Use IIFE format (can change based on your needs)
        name: 'InitScript',
        fileName: () => 'init.js'
      },
      outDir: './public', // Output directory
      emptyOutDir: false, // Don't clear the directory when building
      rollupOptions: {
        output: {
          entryFileNames: 'init.js' // Name of the output file
        }
      },
      watch: isDevelopment ? {} : null
    },
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*' // Allow all origins, since we do not know in which sites the script will be included
      },
      watch: {
        usePolling: true, // Ensures file polling for file changes
        ignored: ['node_modules/**', 'public/**'] // Ignore node_modules and output directory
      }
    }
  }
})
