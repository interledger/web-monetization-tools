import type { ExecutionContext } from '@cloudflare/workers-types'

export interface Env {
  ASSETS: {
    fetch: typeof fetch
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const url = new URL(request.url)

      if (url.pathname === '/init.js') {
        const assetRequest = new Request(
          `${url.origin}/public/init.js`,
          request
        )
        const response = await env.ASSETS.fetch(assetRequest)

        const headers = new Headers(response.headers)
        headers.set('X-Content-Type-Options', 'nosniff')
        headers.set('Content-Type', 'application/javascript; charset=utf-8')

        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
        // cache for 24 hours
        headers.set('Cache-Control', 'public, max-age=86400')

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        })
      }

      return new Response('Web Monetization Embed Script', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 })
    }
  }
}
