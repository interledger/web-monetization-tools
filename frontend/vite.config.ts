import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const basepath = process.env.APP_BASEPATH ?? '/tools'

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      ssr: true,
      basename: basepath,
      ignoredRouteFiles: ['**/.*'],
      appDirectory: 'app',
      buildDirectory: 'build',
      serverModuleFormat: 'esm',
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
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  build: {
    assetsDir: `${basepath.replace('/', '')}/assets`,
    sourcemap: true,
    target: 'esnext'
  }
})
