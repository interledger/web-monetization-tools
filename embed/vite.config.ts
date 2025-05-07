import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    build: {
      lib: {
        // entry point for the script file
        entry: resolve(__dirname, 'script/index.tsx'),
        formats: ['iife'],
        name: 'InitScript',
        fileName: () => 'init.js'
      },
      outDir: './public',
      // don't clear the directory when building
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: 'init.js',
          // ensure all code is in one file
          inlineDynamicImports: true,
          compact: !isDevelopment,
          manualChunks: undefined
        }
      },
      cssCodeSplit: false,
      minify: !isDevelopment,
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
