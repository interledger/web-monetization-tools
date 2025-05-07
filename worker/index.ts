import initScript from '../embed/public/init.js?raw'

export default {
  fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname === '/init.js') {
      return new Response(initScript, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          // cache for 24 hours
          'Cache-Control': 'public, max-age=86400'
        }
      })
    }

    return new Response(`Web Monetization Tools Worker`, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}
