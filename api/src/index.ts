import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ConfigStorageService } from './utils/config-storage.js'
import {
  OpenPaymentsService,
  type QuoteResponse
} from './utils/open-payments.js'
import type { ConfigVersions } from './types.js'
import type { PendingGrant } from '@interledger/open-payments'

export type Env = {
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_REGION: string
  AWS_BUCKET_NAME: string
  OP_WALLET_ADDRESS: string
  OP_PRIVATE_KEY: string
  OP_KEY_ID: string
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    // seconds the browser should cache the preflight response
    maxAge: 7200
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

app.post('/tools/payment/quote', async ({ req, json, env }) => {
  try {
    const body = (await req.json()) as {
      senderWalletAddress: string
      receiverWalletAddress: string
      amount: number
      note?: string
    }
    const { senderWalletAddress, receiverWalletAddress, amount, note } = body

    if (!senderWalletAddress || !receiverWalletAddress || !amount) {
      return json(
        {
          error:
            'Missing required fields: senderWalletAddress, receiverWalletAddress, amount'
        },
        500
      )
    }

    const openPayments = await OpenPaymentsService.getInstance(env)
    const result = await openPayments.createPaymentQuote({
      senderWalletAddress,
      receiverWalletAddress,
      amount,
      note
    })

    return json(result)
  } catch (error) {
    return json(
      {
        error: 'Payment processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    )
  }
})

app.post('/tools/payment/grant', async ({ req, json, env }) => {
  try {
    const body = await req.json()
    const { senderWalletAddress, debitAmount, receiveAmount } = body

    if (!senderWalletAddress || !debitAmount || !receiveAmount) {
      return json(
        {
          error:
            'Missing required fields: senderWalletAddress, debitAmount, receiveAmount'
        },
        500
      )
    }

    const openPayments = await OpenPaymentsService.getInstance(env)
    const result = await openPayments.initializePayment({
      senderWalletAddress,
      debitAmount,
      receiveAmount
    })

    return json(result)
  } catch (error) {
    return json(
      {
        error: 'Failed to create outgoing payment grant',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    )
  }
})

app.post('/tools/payment/finalize', async ({ req, json, env }) => {
  try {
    const body = (await req.json()) as {
      walletAddress: string
      grant: PendingGrant
      quote: QuoteResponse
      interactRef: string
    }
    const { walletAddress, grant, quote, interactRef } = body

    if (!walletAddress || !grant || !quote || !interactRef) {
      return json(
        {
          error:
            'Missing required fields: walletAddress, grant, quote, interactRef'
        },
        400
      )
    }

    const openPaymentsService = await OpenPaymentsService.getInstance(env)
    const result = await openPaymentsService.finishPaymentProcess(
      walletAddress,
      grant,
      quote,
      interactRef
    )

    return json(result)
  } catch (error) {
    return json(
      {
        error: 'Failed to finish payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    )
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
        },
        {
          path: '/tools/payment/quote',
          methods: ['POST'],
          description: 'Create payment quote'
        },
        {
          path: '/tools/payment/grant',
          methods: ['POST'],
          description: 'Create outgoing payment grant'
        },
        {
          path: '/tools/payment/finalize',
          methods: ['POST'],
          description: 'Finish payment process'
        }
      ],
      timestamp: new Date().toISOString()
    },
    200
  )
})

export default app
