import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import { AutoRouter } from 'itty-router'
import * as build from '../build/server'

const router = AutoRouter()

router.get('/tools/default', async (request) => {
  return await fetch(
    new Request(new URL('/api/tools/default', request.url), request)
  )
})

router.get('/tools', async () => {
  // const url = tag ? `/api/tools/${tag}` : `/api/tools}`
  return new Response(JSON.stringify({
    message: `Hello from itty-router!`,
    timestamp: new Date().toISOString()
  }), {
      headers: {
      'Content-Type': 'application/json'
      }
  });
})

const remixRequestHandler = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(context) {
    // hand-off Cloudflare ENV vars to the Remix `context` object
    return { env: context.env }
  }
})

export const onRequest: PagesFunction<Env> = async (context) => {
  console.log('!!!onRequest', context.request.url , ' !!! ', context.env)
  const ittyResponse = await router.fetch(context.request)
  if (ittyResponse.ok) {
    return ittyResponse
  }
  return await remixRequestHandler(context)
}
