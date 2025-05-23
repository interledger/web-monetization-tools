import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    define: {
      'import.meta.env.VITE_SCRIPT_FRONTEND_URL': JSON.stringify(
        isDevelopment
          ? 'http://localhost:3000/'
          : 'https://webmonetization.org.pages.dev/tools/'
      ),
      'import.meta.env.VITE_SCRIPT_API_URL': JSON.stringify(
        isDevelopment
          ? 'http://localhost:8787/'
          : 'https://api.webmonetization.org.pages.dev/'
      ),
      'import.meta.env.VITE_SCRIPT_ILPAY_URL': JSON.stringify(
        'https://interledgerpay.com/extension/'
      )
    },
    build: {
      lib: {
        // entry point for the script file
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['iife'],
        name: 'InitScript',
        fileName: () => 'init.js'
      },
      outDir: resolve(__dirname, 'public'),
      // don't clear the directory when building
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: 'init.js',
          // ensure all code is in one file
          inlineDynamicImports: true,
          compact: !isDevelopment,
          manualChunks: undefined
        },
        external: []
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

// FIND THE BUG
