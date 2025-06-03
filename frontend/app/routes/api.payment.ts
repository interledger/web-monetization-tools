import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { formatAmount } from '../lib/utils.js'
import { getValidWalletAddress, fetchQuote } from '~/utils/open-payments.server'

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { senderWalletAddress, receiverWalletAddress, amount, note } =
      (await request.json()) as {
        senderWalletAddress: string
        receiverWalletAddress: string
        amount: number
        note?: string
      }

    console.log('SENDER WALLET ADDRESS: ', senderWalletAddress)
    console.log('RECEIVER WALLET ADDRESS: ', receiverWalletAddress)

    const receiverWallet = await getValidWalletAddress(
      env,
      receiverWalletAddress
    )
    const quote = await fetchQuote(
      { walletAddress: senderWalletAddress, amount, note },
      receiverWallet,
      env
    )
    if (!receiverWallet) {
      return json({ error: 'Invalid receiver wallet address' }, { status: 400 })
    }

    const receiveAmount = formatAmount({
      value: quote.receiveAmount.value,
      assetCode: quote.receiveAmount.assetCode,
      assetScale: quote.receiveAmount.assetScale
    })

    const debitAmount = formatAmount({
      value: quote.debitAmount.value,
      assetCode: quote.debitAmount.assetCode,
      assetScale: quote.debitAmount.assetScale
    })

    return json({
      walletAddress: senderWalletAddress,
      receiveAmount: receiveAmount.amountWithCurrency,
      debitAmount: debitAmount.amountWithCurrency,
      receiverName: receiverWallet.publicName,
      quote,
      isQuote: true
    } as const)
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
