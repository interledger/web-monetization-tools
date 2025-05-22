import * as build from './build/server/index.js' // eslint-disable-line import/no-unresolved

import { createRequestHandler, type ServerBuild } from '@remix-run/cloudflare'

declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(build as unknown as ServerBuild)

export default {
  async fetch(request, env, ctx) {
    try {
      return await requestHandler(request, {
        cloudflare: { env, ctx }
      })
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`
      return new Response(errorMessage, { status: 500 })
    }
  }
} satisfies ExportedHandler<Env>
