import { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/react'
import { commitSession, getSession } from '~/lib/server/session.server'
import { isGrantValidAndAccepted } from '~/lib/server/open-payments.server'
import { toWalletAddressUrl } from '../lib/utils.js'
import { type WalletAddress } from '@interledger/open-payments'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const url = new URL(request.url)
  const interactRef = url.searchParams.get('interact_ref') || ''
  const result = url.searchParams.get('result') || ''

  const session = await getSession(request.headers.get('Cookie'))
  const walletAddress = session.get('wallet-address')
  const grant = session.get('payment-grant')

  const isGrantResponse = true
  let grantResponse = result == 'grant_rejected' ? 'Grant was declined' : ''
  let isGrantAccepted = false

  if (walletAddress && grant && interactRef) {
    try {
      isGrantAccepted = await isGrantValidAndAccepted(grant, interactRef)
    } catch (_err) {
      isGrantAccepted = false
    }
    if (isGrantAccepted) {
      grantResponse = 'Wallet ownership confirmed!'
      session.set('validForWallet', walletAddress.id)
    }
    session.unset('payment-grant')
  }

  session.set('is-grant-accepted', isGrantAccepted)
  session.set('is-grant-response', isGrantResponse)
  session.set('grant-response', grantResponse)

  return redirect(`/create/${elementType}`, {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  })
}

export function normalizeWalletAddress(walletAddress: WalletAddress) {
  const IS_INTERLEDGER_CARDS =
    walletAddress.authServer === 'https://auth.interledger.cards'
  const url = new URL(toWalletAddressUrl(walletAddress.id))
  if (IS_INTERLEDGER_CARDS && url.host === 'ilp.dev') {
    // For Interledger Cards we can have two types of wallet addresses:
    //  - ilp.interledger.cards
    //  - ilp.dev (just a proxy behind ilp.interledger.cards for certain wallet addresses)
    //
    // `ilp.dev` wallet addresses are only used for wallet addresses that are
    // linked to a card.
    //
    // `ilp.interledger.cards` used for the other wallet addresses (user created)
    //
    // Not all `ilp.interledger.cards` wallet addresses can be used with `ilp.dev`.
    // Manually created wallet addresses cannot be used with `ilp.dev`.
    return walletAddress.id.replace('ilp.dev', 'ilp.interledger.cards')
  }
  return walletAddress.id
}

//
