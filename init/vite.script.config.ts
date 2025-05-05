// vite.script.config.ts
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    build: {
      lib: {
        // entry point for the script file
        entry: './script/index.tsx',
        formats: ['iife'],
        name: 'InitScript',
        fileName: () => 'init.js'
      },
      outDir: './public',
      // don't clear the directory when building
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: 'init.js'
        }
      },
      watch: isDevelopment ? {} : null
    },
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      watch: {
        // ensures file polling for file changes
        usePolling: true,
        ignored: ['node_modules/**', 'public/**']
      }
    }
  }
})
