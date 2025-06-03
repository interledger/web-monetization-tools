import type { Quote } from '@interledger/open-payments'
import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { initializePayment } from '~/utils/open-payments.server'

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { senderWalletAddress, debitAmount, receiveAmount } =
      (await request.json()) as {
        senderWalletAddress: string
        debitAmount: Quote['debitAmount']
        receiveAmount: Quote['receiveAmount']
      }

    console.log('### Processing payment: ', {
      senderWalletAddress,
      debitAmount,
      receiveAmount
    })

    const grant = await initializePayment(
      {
        walletAddress: senderWalletAddress,
        debitAmount,
        receiveAmount
      },
      env
    )

    return json({ grant } as const)
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
