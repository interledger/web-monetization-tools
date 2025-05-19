import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: false, 
        global: true,
        process: 'build'
      },
      overrides: {
        crypto: 'crypto'
      },
      protocolImports: true
    }),
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
