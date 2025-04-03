import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import { Router } from 'itty-router'

const router = Router()

router.get('/tools/default', async (request) => {
  return await fetch(
    new Request(new URL('/api/tools/default', request.url), request)
  )
})

router.get('/tools/:id/:tag?', async (request, { id, tag }) => {
  const url = tag ? `/api/tools/${id}/${tag}` : `/api/tools/${id}`
  return await fetch(new Request(new URL(url, request.url), request))
})

const remixRequestHandler = createPagesFunctionHandler({
  build: process.env.NODE_ENV === "development" 
  ? require("@remix-run/dev/server-build") 
  : require("../build"),
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env
})

export const onRequest: PagesFunction = async (context) => {
    const response = await router.handle(context.request);
    return response || remixRequestHandler(context);
  };
  