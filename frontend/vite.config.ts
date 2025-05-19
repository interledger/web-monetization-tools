import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  resolve: {
    alias: [
            {
        find:'node:crypto',
        replacement: './crypto-polyfill.js',
      },
      {
        find:'crypto',
        replacement: './crypto-polyfill.js',
      }
    ]
  },
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true
      }
    }),
    tsconfigPaths()
  ],
  build: {
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
    target: 'esnext'
  }
})
