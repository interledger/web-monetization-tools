/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'cloudflare-workers',
  server: './server.ts',
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ['**/.*'],

  appDirectory: 'app',
  assetsBuildDirectory: 'build/client',
  publicPath: '/',
  serverBuildPath: 'build/server/index.js',

  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true
  },
  serverModuleFormat: 'esm',
  serverDependenciesToBundle: 'all',
  vite: true
}
