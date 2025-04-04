import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    server: {
      watch: isDevelopment
        ? {
            usePolling: true
          }
        : undefined,
      // https: isDevelopment
      //   ? {
      //       key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
      //       cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem'))
      //     }
      //   : undefined,
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
        }
      }),
      tsconfigPaths()
    ]
  }
})
