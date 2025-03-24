import { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/react'
import { commitSession, getSession } from '~/lib/server/session.server'
import { isGrantValidAndAccepted } from '~/lib/server/open-payments.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const url = new URL(request.url)
  const interactRef = url.searchParams.get('interact_ref') || ''
  const result = url.searchParams.get('result') || ''
  
  const session = await getSession(request.headers.get('Cookie'))
  const contentOnly = session.get('content-only')
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
  console.log('contentOnly --------------------3', contentOnly)

  return redirect(`/create/${elementType}/${contentOnly ? '?contentOnly' : ''}`, {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  })
}
