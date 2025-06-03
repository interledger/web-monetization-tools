import {
  type PendingGrant,
  type WalletAddress,
  type AuthenticatedClient,
  type OutgoingPayment,
  type Quote,
  isFinalizedGrant,
  isPendingGrant,
  createAuthenticatedClient
} from '@interledger/open-payments'
import { createId } from '@paralleldrive/cuid2'
import { toWalletAddressUrl } from './utils.server'
import { createContentDigestHeader } from 'httpbis-digest-headers'
import { signMessage } from 'http-message-signatures/lib/httpbis'
import type { Request } from 'http-message-signatures'
import * as ed from '@noble/ed25519'

interface RequestLike extends Request {
  body?: string
}

interface SignOptions {
  request: RequestLike
  privateKey: Uint8Array
  keyId: string
}

export interface SignatureHeaders {
  'Signature': string
  'Signature-Input': string
}

interface ContentHeaders {
  'Content-Digest': string
  'Content-Length': string
  'Content-Type': string
}
type Headers = SignatureHeaders & Partial<ContentHeaders>

let client: AuthenticatedClient
/**
 * Creates an authenticated Open Payments client for making signed requests.
 * Based on the Interledger Web Monetization Extension implementation:
 * @see https://github.com/interledger/web-monetization-extension/blob/main/src/background/services/openPayments.ts#L163
 */
async function createClient(env: Env) {
  client ??= await createAuthenticatedClient({
    validateResponses: false,
    requestTimeoutMs: 10000,
    walletAddressUrl: env.OP_WALLET_ADDRESS,
    authenticatedRequestInterceptor: async (request) => {
      if (!request.method || !request.url) {
        throw new Error('Cannot intercept request: url or method missing')
      }

      const initialRequest = request.clone()

      const headers = await createHeaders({
        request: {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
          body: request.body ? JSON.stringify(await request.json()) : undefined
        },
        privateKey: Buffer.from(env.OP_PRIVATE_KEY, 'base64'),
        keyId: env.OP_KEY_ID
      })

      if (request.body) {
        initialRequest.headers.set(
          'Content-Type',
          headers['Content-Type'] as string
        )
        initialRequest.headers.set(
          'Content-Digest',
          headers['Content-Digest'] as string
        )
      }

      initialRequest.headers.set('Signature', headers['Signature'] as string)
      initialRequest.headers.set('Signature-Input', headers['Signature-Input'])

      return initialRequest as typeof request
    }
  })

  return client
}

export async function getValidWalletAddress(env: Env, walletAddress: string) {
  const opClient = await createClient(env)
  const response = await getWalletAddress(env, walletAddress, opClient)
  return response
}

export async function createInteractiveGrant(
  env: Env,
  args: {
    walletAddress: WalletAddress
    redirectUrl?: string
  }
) {
  const opClient = await createClient(env)
  const clientNonce = crypto.randomUUID()
  const paymentId = createId()

  const outgoingPaymentGrant = await createOutgoingPaymentGrant({
    walletAddress: args.walletAddress,
    debitAmount: {
      value: String(1 * 10 ** args.walletAddress.assetScale),
      assetCode: args.walletAddress.assetCode,
      assetScale: args.walletAddress.assetScale
    },
    nonce: clientNonce,
    paymentId: paymentId,
    opClient,
    redirectUrl: args.redirectUrl
  })

  return outgoingPaymentGrant
}

export interface Amount {
  value: string
  assetCode: string
  assetScale: number
}

type CreateOutgoingPaymentParams = {
  walletAddress: WalletAddress
  debitAmount: Amount
  receiveAmount?: Amount
  nonce?: string
  paymentId: string
  opClient: AuthenticatedClient
}

async function createOutgoingPaymentGrant(
  params: CreateOutgoingPaymentParams & { redirectUrl?: string }
): Promise<PendingGrant> {
  const {
    walletAddress,
    debitAmount,
    nonce,
    paymentId,
    opClient,
    redirectUrl,
    receiveAmount
  } = params

  const grant = await opClient.grant
    .request(
      {
        url: walletAddress.authServer
      },
      {
        access_token: {
          access: [
            {
              identifier: walletAddress.id,
              type: 'outgoing-payment',
              actions: ['create', 'read'],
              limits: {
                debitAmount: debitAmount
              }
            }
          ]
        },
        interact: {
          start: ['redirect'],
          finish: {
            method: 'redirect',
            uri: `${redirectUrl}?paymentId=${paymentId}`,
            nonce: nonce || ''
          }
        }
      }
    )
    .catch((error) => {
      throw new Error('Could not retrieve outgoing payment grant.', {
        cause: error
      })
    })

  if (!isPendingGrant(grant)) {
    throw new Error('Expected interactive outgoing payment grant.')
  }

  return grant
}

async function createIncomingPaymentGrant(
  urlAuthServer: string,
  opClient: AuthenticatedClient
) {
  const nonInteractiveGrant = await opClient.grant.request(
    {
      url: urlAuthServer
    },
    {
      access_token: {
        access: [
          {
            type: 'incoming-payment',
            actions: ['read', 'create', 'complete']
          }
        ]
      }
    }
  )

  if (isPendingGrant(nonInteractiveGrant)) {
    throw new Error('Expected non-interactive grant')
  }

  return nonInteractiveGrant
}

type QuoteGrantParams = {
  authServer: string
  opClient: AuthenticatedClient
}

async function createQuoteGrant({ authServer, opClient }: QuoteGrantParams) {
  return await opClient.grant
    .request(
      {
        url: authServer
      },
      {
        access_token: {
          access: [
            {
              type: 'quote',
              actions: ['create', 'read']
            }
          ]
        }
      }
    )
    .catch(() => {
      throw new Error('Could not retrieve quote grant.')
    })
}

export async function isGrantValidAndAccepted(
  env: Env,
  payment: PendingGrant,
  interactRef: string
): Promise<boolean> {
  const opClient = await createClient(env)

  const continuation = await opClient.grant.continue(
    {
      accessToken: payment.continue.access_token.value,
      url: payment.continue.uri
    },
    {
      interact_ref: interactRef
    }
  )

  if (!isFinalizedGrant(continuation)) {
    return false
  }

  // when continuation has access_token value it has been accepted by user
  return continuation?.access_token?.value ? true : false
}

export type QuoteResponse = Quote & { incomingPaymentGrantToken: string }

export async function fetchQuote(
  args: {
    walletAddress: string
    amount: number
    note?: string
  },
  receiver: WalletAddress,
  env: Env
): Promise<QuoteResponse> {
  const opClient = await createClient(env)
  const walletAddress = await getWalletAddress(
    env,
    args.walletAddress,
    opClient
  )

  const amountObj = {
    value: BigInt(
      (args.amount * 10 ** walletAddress.assetScale).toFixed()
    ).toString(),
    assetCode: walletAddress.assetCode,
    assetScale: walletAddress.assetScale
  }

  const incomingPaymentGrant = await createIncomingPaymentGrant(
    receiver.authServer,
    opClient
  )

  // create incoming payment without incoming amount
  const incomingPayment = await createIncomingPayment({
    accessToken: incomingPaymentGrant.access_token.value,
    walletAddress: receiver,
    note: args.note || '',
    opClient
  })

  const quoteGrant = await createQuoteGrant({
    authServer: walletAddress.authServer,
    opClient: opClient
  })

  if (isPendingGrant(quoteGrant)) {
    throw new Error('Expected non-interactive grant')
  }

  // create quote with debit amount, you don't care how much money receiver gets
  const quote = await opClient.quote
    .create(
      {
        url: walletAddress.resourceServer,
        accessToken: quoteGrant.access_token.value
      },
      {
        method: 'ilp',
        walletAddress: walletAddress.id,
        receiver: incomingPayment.id,
        debitAmount: amountObj
      }
    )
    .catch(() => {
      throw new Error(
        `Could not create quote for receiver ${receiver.publicName}.`
      )
    })

  const response = {
    incomingPaymentGrantToken: incomingPaymentGrant.access_token.value,
    ...quote
  }

  return response
}

type CreateIncomingPaymentParams = {
  accessToken: string
  walletAddress: WalletAddress
  note: string
  opClient: AuthenticatedClient
}

async function createIncomingPayment({
  accessToken,
  walletAddress,
  note,
  opClient
}: CreateIncomingPaymentParams) {
  // create incoming payment without amount
  return await opClient.incomingPayment
    .create(
      {
        url: walletAddress.resourceServer,
        accessToken: accessToken
      },
      {
        expiresAt: new Date(Date.now() + 6000 * 60).toISOString(),
        walletAddress: walletAddress.id,
        metadata: {
          description: note
        }
      }
    )
    .catch(() => {
      throw new Error('Unable to create incoming payment.')
    })
}

export async function getWalletAddress(
  env: Env,
  url: string,
  opClient?: AuthenticatedClient
) {
  opClient ??= await createClient(env)
  const walletAddress = await opClient.walletAddress
    .get({
      url: toWalletAddressUrl(url)
    })
    .catch(() => {
      throw new Error('Invalid wallet address.')
    })

  return walletAddress
}

export async function initializePayment(
  args: {
    walletAddress: string
    debitAmount: Amount
    receiveAmount: Amount
  },
  env: Env
): Promise<PendingGrant> {
  const opClient = await createClient(env)
  const walletAddress = await getWalletAddress(
    env,
    args.walletAddress,
    opClient
  )
  const clientNonce = crypto.randomUUID()
  const paymentId = createId()

  const outgoingPaymentGrant = await createOutgoingPaymentGrant({
    walletAddress: walletAddress,
    debitAmount: args.debitAmount,
    receiveAmount: args.receiveAmount,
    nonce: clientNonce,
    paymentId: paymentId,
    opClient,
    redirectUrl: `http://localhost:3000/tools/payment-confirmation`
  })

  return outgoingPaymentGrant
}

export async function finishPayment(
  outgoingGrant: PendingGrant,
  quote: Quote,
  walletAddress: WalletAddress,
  interactRef: string,
  env: Env
): Promise<{ url: string; accessToken: string }> {
  const opClient = await createClient(env)

  console.log('!!! FINISH PAYMENT', {
    payment: outgoingGrant,
    quote,
    walletAddress,
    interactRef
  })

  const continuation = await opClient.grant.continue(
    {
      accessToken: outgoingGrant.continue.access_token.value,
      url: outgoingGrant.continue.uri
    },
    {
      interact_ref: interactRef
    }
  )

  console.log('!!! CONTINUATION', continuation)

  if (!isFinalizedGrant(continuation)) {
    throw new Error('Expected finalized grant.')
  }

  const url = walletAddress.resourceServer

  const outgoingPayment = await opClient.outgoingPayment
    .create(
      {
        url: url,
        accessToken: continuation.access_token.value
      },
      {
        walletAddress: walletAddress.id,
        quoteId: quote.id,
        metadata: {
          description: 'Tools Payment'
        }
      }
    )
    .catch((error) => {
      throw new Error('Could not create outgoing payment.')
    })

  return {
    url: outgoingPayment.id,
    accessToken: continuation.access_token.value
  }
}

export async function checkOutgoingPayment(
  finishPaymentUrl: string,
  accessToken: string,
  accessTokenIncomingPayment: string,
  receiver: string,
  env: Env
): Promise<OutgoingPayment> {
  const opClient = await createClient(env)
  await timeout(3000)

  // get outgoing payment, to check if there was enough balance
  const checkOutgoingPaymentResponse = await opClient.outgoingPayment.get({
    url: finishPaymentUrl,
    accessToken: accessToken
  })

  if (!(Number(checkOutgoingPaymentResponse.sentAmount.value) > 0)) {
    throw new Error('Payment failed. Check your balance and try again.')
  }

  await opClient.incomingPayment
    .complete({
      url: receiver,
      accessToken: accessTokenIncomingPayment
    })
    .catch(() => {
      throw new Error('Could not complete incoming payment.')
    })

  return checkOutgoingPaymentResponse
}

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay))
}

async function createHeaders({
  request,
  privateKey,
  keyId
}: SignOptions): Promise<Headers> {
  if (request.body) {
    const contentHeaders = createContentHeaders(request.body)
    request.headers = { ...request.headers, ...contentHeaders }
  }

  const signatureHeaders = await createSignatureHeaders({
    request,
    privateKey,
    keyId
  })

  return {
    ...request.headers,
    ...signatureHeaders
  }
}

function createContentHeaders(body: string): ContentHeaders {
  return {
    'Content-Digest': createContentDigestHeader(
      JSON.stringify(JSON.parse(body)),
      ['sha-512']
    ),
    'Content-Length': new TextEncoder().encode(body).length.toString(),
    'Content-Type': 'application/json'
  }
}

async function createSignatureHeaders({
  request,
  privateKey,
  keyId
}: SignOptions): Promise<SignatureHeaders> {
  const components = ['@method', '@target-uri']
  if (request.headers.Authorization || request.headers.authorization) {
    components.push('authorization')
  }

  if (request.body) {
    components.push('content-digest', 'content-length', 'content-type')
  }

  const signingKey = createSigner(privateKey, keyId)
  const { headers } = await signMessage(
    {
      name: 'sig1',
      params: ['keyid', 'created'],
      fields: components,
      key: signingKey
    },
    {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
  )

  return {
    'Signature': headers.Signature as string,
    'Signature-Input': headers['Signature-Input'] as string
  }
}

function createSigner(key: Uint8Array, keyId: string) {
  return {
    id: keyId,
    alg: 'ed25519',
    async sign(data: Uint8Array) {
      return Buffer.from(await ed.signAsync(data, key))
    }
  }
}
