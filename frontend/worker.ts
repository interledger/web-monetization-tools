import { APP_BASEPATH } from '~/lib/constants.js'
import { createRequestHandler, type ServerBuild } from '@remix-run/cloudflare'

declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)

      if (url.pathname === '/') {
        return Response.redirect(new URL(`${APP_BASEPATH}/`, request.url), 302)
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const build = await import('./build/server/index.js')
      const requestHandler = createRequestHandler(
        build as unknown as ServerBuild
      )

      return await requestHandler(request, {
        cloudflare: { env, ctx }
      })
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`
      return new Response(errorMessage, { status: 500 })
    }
  }
} satisfies ExportedHandler<Env>
