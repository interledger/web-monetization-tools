import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {
  type QuoteResponse,
  checkOutgoingPayment,
  finishPayment,
  getValidWalletAddress
} from '~/utils/open-payments.server'
import type { PendingGrant } from '@interledger/open-payments'

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { walletAddress, grant, quote, interactRef } =
      (await request.json()) as {
        walletAddress: string
        grant: PendingGrant
        quote: QuoteResponse
        interactRef: string
      }

    const senderWalletAddress = await getValidWalletAddress(env, walletAddress)
    const finishPaymentResponse = await finishPayment(
      grant,
      quote,
      senderWalletAddress,
      interactRef,
      env
    )

    console.log('### Payment finished response: ', finishPaymentResponse)

    const outgoingPayment = await checkOutgoingPayment(
      finishPaymentResponse.url,
      finishPaymentResponse.accessToken,
      quote.incomingPaymentGrantToken,
      quote.receiver,
      env
    )

    console.log('### Payment finished successfully? ', outgoingPayment)

    return json({ outgoingPayment } as const)
  } catch (error) {
    console.error('Payment API error:', error)
    return json(
      {
        error: 'Payment processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
