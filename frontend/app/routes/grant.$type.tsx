import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/react'
import { commitSession, getSession } from '~/lib/server/session.server'
import { isGrantValidAndAccepted } from '~/lib/server/open-payments.server'

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const {
    cloudflare: { env }
  } = context

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
      isGrantAccepted = await isGrantValidAndAccepted(env, grant, interactRef)
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
