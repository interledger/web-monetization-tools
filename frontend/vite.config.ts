import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    server: {
      watch: isDevelopment
        ? {
            usePolling: true
          }
        : undefined,
      port: 5100,
      strictPort: true,
      host: '0.0.0.0',
      proxy: {}
    },
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true
          // v3_singleFetch: true
        }
      }),
      tsconfigPaths()
    ]
  }
})
