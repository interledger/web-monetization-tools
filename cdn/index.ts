import initScript from 'publisher-tools-embed/dist/init.js?raw'

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
          // cache for 5 minutes
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    return new Response(`Publisher Tools Worker`, {
      status: 404,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}
