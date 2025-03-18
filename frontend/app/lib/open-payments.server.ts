import {
  type AuthenticatedClient,
  type PendingGrant,
  type Quote,
  type WalletAddress,
  createAuthenticatedClient,
  isFinalizedGrant,
  isPendingGrant
} from '@interledger/open-payments'
import { createId } from '@paralleldrive/cuid2'
import { randomUUID } from 'crypto'
import { toWalletAddressUrl } from './utils.js'

async function createClient() {
  return await createAuthenticatedClient({
    keyId: process.env.OP_KEY_ID!,
    privateKey: Buffer.from(process.env.OP_PRIVATE_KEY!, 'base64'),
    walletAddressUrl: process.env.OP_WALLET_ADDRESS!
  })
}

export async function getValidWalletAddress(walletAddress: string) {
  const opClient = await createClient()
  const response = await getWalletAddress(walletAddress, opClient)
  return response
}

type QuoteResponse = Quote & { incomingPaymentGrantToken: string }

export async function fetchQuote({
  senderAddress,
  receiverAddress,
  amount,
  note
}: {
  senderAddress: WalletAddress
  receiverAddress: WalletAddress
  amount: number
  note?: string
}): Promise<QuoteResponse> {
  const opClient = await createClient()
  const amountObj = {
    value: BigInt(
      (amount * 10 ** senderAddress.assetScale).toFixed()
    ).toString(),
    assetCode: senderAddress.assetCode,
    assetScale: senderAddress.assetScale
  }

  const incomingPaymentGrant = await getIncomingPaymentGrant(
    receiverAddress.authServer,
    opClient
  )

  // create incoming payment without incoming amount
  const incomingPayment = await createIncomingPayment({
    accessToken: incomingPaymentGrant.access_token.value,
    walletAddress: receiverAddress,
    note: note || '',
    opClient
  })

  const quoteGrant = await getQuoteGrant({
    authServer: senderAddress.authServer,
    opClient: opClient
  })

  if (isPendingGrant(quoteGrant)) {
    throw new Error('Expected non-interactive grant')
  }

  // create quote with debit amount, you don't care how much money receiver gets
  const quote = await opClient.quote
    .create(
      {
        url: new URL(senderAddress.id).origin,
        accessToken: quoteGrant.access_token.value
      },
      {
        method: 'ilp',
        walletAddress: senderAddress.id,
        receiver: incomingPayment.id,
        debitAmount: amountObj
      }
    )
    .catch((error) => {
      console.log({ error })
      throw new Error(
        `Could not create quote for receiver ${receiverAddress.publicName}.`
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
        url: new URL(walletAddress.id).origin,
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

export async function createInteractiveGrant(args: {
  walletAddress: WalletAddress
  quote: Quote
  redirectUrl?: string
}) {
  const opClient = await createClient()
  const clientNonce = randomUUID()
  const paymentId = createId()

  const outgoingPaymentGrant = await createOutgoingPaymentGrant({
    walletAddress: args.walletAddress,
    debitAmount: args.quote.debitAmount,
    receiveAmount: args.quote.receiveAmount,
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
  debitAmount?: Amount
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
    receiveAmount,
    nonce,
    paymentId,
    opClient,
    redirectUrl
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
              actions: ['create', 'read', 'list'],
              limits: {
                debitAmount: debitAmount,
                receiveAmount: receiveAmount
              }
            }
          ]
        },
        interact: {
          start: ['redirect'],
          finish: {
            method: 'redirect',
            uri: `${redirectUrl ?? process.env.OP_REDIRECT_URL}?paymentId=${paymentId}`,
            nonce: nonce || ''
          }
        }
      }
    )
    .catch((error) => {
      console.log({ error })
      throw new Error('Could not retrieve outgoing payment grant.')
    })

  if (!isPendingGrant(grant)) {
    throw new Error('Expected interactive outgoing payment grant.')
  }

  return grant
}

export async function isGrantValidAndAccepted(
  payment: PendingGrant,
  interactRef: string
): Promise<boolean> {
  const opClient = await createClient()

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

export async function getWalletAddress(
  url: string,
  opClient?: AuthenticatedClient
) {
  opClient = opClient ? opClient : await createClient()
  const walletAddress = await opClient.walletAddress
    .get({
      url: toWalletAddressUrl(url)
    })
    .catch((error) => {
      console.log({ error })
      throw new Error('Invalid wallet address.')
    })

  return walletAddress
}

type QuoteGrantParams = {
  authServer: string
  opClient: AuthenticatedClient
}

async function getQuoteGrant({ authServer, opClient }: QuoteGrantParams) {
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

async function getIncomingPaymentGrant(
  url: string,
  opClient: AuthenticatedClient
) {
  const nonInteractiveGrant = await opClient.grant.request(
    {
      url: url
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
