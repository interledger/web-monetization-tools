import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ConfigStorageService } from './utils/config-storage.js'
import type { ConfigVersions } from './types.js'

export type Env = {
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_REGION: string
  AWS_BUCKET_NAME: string
}

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept'],
    exposeHeaders: ['Content-Length'],
    credentials: false,
    maxAge: 300
  })
)

app.use('*', async (c, next) => {
  try {
    await next()
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'server error occurred'
      },
      500
    )
  }
})

app.get('/tools/config/:wa/:version?', async ({ req, json, env }) => {
  const wa = req.param('wa')
  const version = req.param('version') || 'default'
  console.log('Received request for tools configuration ', wa)

  if (!wa) {
    return json({ error: 'Wallet Address parameter is required' }, 500)
  }

  try {
    const storageService = new ConfigStorageService(env)
    const config = await storageService.getJson<ConfigVersions>(wa)

    return json(config[version])
  } catch (error) {
    console.error('S3 Error:', error)
    return json({ error: 'Failed to fetch object from S3' }, 500)
  }
})

app.get('/', (c) => {
  return c.json(
    {
      status: 'ok',
      message: 'Publisher Tools API',
      endpoints: [
        {
          path: '/tools/config/:wa/:version',
          methods: ['GET'],
          description: 'Get tools configuration for a wallet address'
        }
      ],
      timestamp: new Date().toISOString()
    },
    200
  )
})

export default app
