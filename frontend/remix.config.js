/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverBuildTarget: 'cloudflare-pages',
  server: './server.ts',
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  future: {
    v3_fetcherPersist: true
  }
}
