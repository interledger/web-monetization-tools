import { createRequestHandler, type ServerBuild } from '@remix-run/cloudflare'
import * as build from './build/server' // eslint-disable-line import/no-unresolved

import { getLoadContext } from './load-context'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRemixRequest = createRequestHandler(build as any as ServerBuild)

export default {
  async fetch(request, env, ctx) {
    try {
      const loadContext = getLoadContext({
        request,
        context: {
          cloudflare: {
            cf: request.cf,
            ctx: {
              waitUntil: ctx.waitUntil.bind(ctx),
              passThroughOnException: ctx.passThroughOnException.bind(ctx)
            },
            caches,
            env
          }
        }
      })
      return await handleRemixRequest(request, loadContext)
    } catch (error) {
      return new Response('An unexpected error occurred', { status: 500 })
    }
  }
} satisfies ExportedHandler<Env>
