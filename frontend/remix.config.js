/** @type {import('@remix-run/dev').AppConfig} */
export default {
  vite: (viteConfig) => {
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        crypto: './crypto-polyfill.js',
        'node:crypto': './crypto-polyfill.js'
      }
    };
    return viteConfig;
  },
  serverBuildTarget: 'cloudflare-pages',
  ignoredRouteFiles: ['**/.*'],
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildPath: 'build/server/index.js',
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route('app/routes', '/')
    })
  },
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true
  }
}
