import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '../build/server/index.js'

// @ts-expect-error - cloudflare pages function handler types don't fully match remix types
export const onRequest = createPagesFunctionHandler({ build })
