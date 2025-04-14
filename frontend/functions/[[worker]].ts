import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import { AutoRouter } from 'itty-router'
import * as build from '../build/server/index.js'

const router = AutoRouter()

router.get('/tools/default', async (request) => {
  return await fetch(
    new Request(new URL('/api/tools/default', request.url), request)
  )
})

router.get('/tools', async () => {
  return new Response(
    JSON.stringify({
      message: `Hello from itty-router!`,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
})

const remixRequestHandler = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV
})

export const onRequest: PagesFunction<Env> = async (context) => {
  const ittyResponse = await router.fetch(context.request)
  if (ittyResponse.ok) {
    return ittyResponse
  }
  return await remixRequestHandler(context)
}
