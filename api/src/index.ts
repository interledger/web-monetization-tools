import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { ConfigStorageService } from './utils/config-storage.js'
import { OpenPaymentsService } from './utils/open-payments.js'
import {
  PaymentQuoteSchema,
  PaymentGrantSchema,
  PaymentFinalizeSchema,
  WalletAddressParamSchema
} from './schemas/payment.js'
import type { ConfigVersions } from './types.js'

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
    maxAge: 7200
  })
)

app.use('*', async (c, next) => {
  try {
    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse()
    }
    if (error instanceof ZodError) {
      return c.json(
        {
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: {
              issues: error.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
                code: err.code
              }))
            }
          }
        },
        400
      )
    }

    console.error('Unexpected error:', error)
    return c.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : 'Internal server error',
          details: error instanceof Error ? error.stack : undefined,
          code: 'INTERNAL_ERROR'
        }
      },
      500
    )
  }
})

app.get(
  '/tools/config/:wa/:version?',
  zValidator('param', WalletAddressParamSchema),
  async ({ req, json, env }) => {
    const { wa, version } = req.valid('param')

    try {
      const storageService = new ConfigStorageService(env)
      const config = await storageService.getJson<ConfigVersions>(wa)
      return json(config[version])
    } catch (error) {
      throw new HTTPException(500, {
        message: JSON.stringify({
          error: {
            message: 'Failed to fetch configuration',
            code: 'CONFIG_FETCH_ERROR',
            details: {
              walletAddress: wa,
              version: version,
              originalError:
                error instanceof Error ? error.message : String(error)
            }
          }
        })
      })
    }
  }
)

app.post(
  '/tools/payment/quote',
  zValidator('json', PaymentQuoteSchema),
  async ({ req, json, env }) => {
    try {
      const { senderWalletAddress, receiverWalletAddress, amount, note } =
        req.valid('json')

      const openPayments = await OpenPaymentsService.getInstance(env)
      const result = await openPayments.createPaymentQuote({
        senderWalletAddress,
        receiverWalletAddress,
        amount,
        note
      })

      return json(result)
    } catch (error) {
      console.error('Payment quote creation error: ', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new HTTPException(500, {
        message: JSON.stringify({
          error: {
            message: 'Payment quote creation failed',
            code: 'QUOTE_ERROR',
            details: {
              originalError:
                error instanceof Error ? error.message : String(error)
            }
          }
        })
      })
    }
  }
)

app.post(
  '/tools/payment/grant',
  zValidator('json', PaymentGrantSchema),
  async ({ req, json, env }) => {
    try {
      const { senderWalletAddress, debitAmount, receiveAmount } =
        req.valid('json')

      const openPayments = await OpenPaymentsService.getInstance(env)
      const result = await openPayments.initializePayment({
        senderWalletAddress,
        debitAmount,
        receiveAmount
      })

      return json(result)
    } catch (error) {
      console.error('Payment grant creation error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new HTTPException(500, {
        message: JSON.stringify({
          error: {
            message: 'Payment grant creation failed',
            code: 'GRANT_ERROR',
            details: {
              originalError:
                error instanceof Error ? error.message : String(error)
            }
          }
        })
      })
    }
  }
)

app.post(
  '/tools/payment/finalize',
  zValidator('json', PaymentFinalizeSchema),
  async ({ req, json, env }) => {
    try {
      const { walletAddress, grant, quote, interactRef } = req.valid('json')

      const openPaymentsService = await OpenPaymentsService.getInstance(env)
      const result = await openPaymentsService.finishPaymentProcess(
        walletAddress,
        grant,
        quote,
        interactRef
      )

      return json(result)
    } catch (error) {
      console.error('Payment finalization error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new HTTPException(500, {
        message: JSON.stringify({
          error: {
            message: 'Payment finalization failed',
            code: 'FINALIZE_ERROR',
            details: {
              originalError:
                error instanceof Error ? error.message : String(error)
            }
          }
        })
      })
    }
  }
)

app.get('/', (c) => {
  const routes = app.routes
    .filter((route) => route.method !== 'ALL')
    .map((route) => ({
      path: route.path,
      method: route.method
    }))

  return c.json(
    {
      status: 'ok',
      message: 'Publisher Tools API',
      endpoints: routes,
      timestamp: new Date().toISOString()
    },
    200
  )
})

export default app
