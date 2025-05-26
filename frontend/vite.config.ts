import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy
} from '@remix-run/dev'
import type { IncomingMessage, ServerResponse } from 'http'
import { defineConfig, type ViteDevServer } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const APP_BASEPATH = '/tools'

/**
 * Custom plugin to handle root redirects to basepath in dev
 */
const devRedirectPlugin = () => ({
  name: 'dev-redirect',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      '/',
      (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/') {
          res.writeHead(302, { Location: APP_BASEPATH + '/' })
          res.end()
          return
        }
        next()
      }
    )
  }
})

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      ssr: true,
      basename: APP_BASEPATH,
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
    tsconfigPaths(),
    devRedirectPlugin()
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  build: {
    assetsDir: `${APP_BASEPATH.replace(/^\//, '')}/assets`,
    sourcemap: true,
    target: 'esnext'
  }
})
