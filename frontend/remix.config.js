/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverBuildTarget: 'cloudflare-pages',
  ignoredRouteFiles: ['**/.*'],
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildPath: 'build/server/index.js',
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true
  }
}
