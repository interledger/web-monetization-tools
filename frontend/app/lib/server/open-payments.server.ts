import {
  type AuthenticatedClient,
  type PendingGrant,
  type WalletAddress,
  createAuthenticatedClient,
  isFinalizedGrant,
  isPendingGrant
} from '@interledger/open-payments'
import { createId } from '@paralleldrive/cuid2'
import { toWalletAddressUrl } from '../utils.js'

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

export async function createInteractiveGrant(args: {
  walletAddress: WalletAddress
  redirectUrl?: string
}) {
  const opClient = await createClient()
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
              actions: ['create', 'read'],
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
