import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {  S3Service } from '../lib/server/s3.server'
import { getSession } from '../lib/server/session.server'
import type { ConfigVersions } from '../lib/types'

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'DELETE') {
    return json(
      { error: 'Method not allowed' },
      {
        status: 405
      }
    )
  }

  const formData = await request.formData()

  try {
    const { cloudflare : {env} } = context
    const walletAddress = formData.get('walletAddress') as string
    const version = formData.get('version') as string

    if (!walletAddress || !version) {
      throw new Error('Wallet address and version are required')
    }

    const session = await getSession(request.headers.get('Cookie'))
    const validForWallet = session?.get('validForWallet')

    if (!session || validForWallet !== walletAddress) {
      throw new Error('Grant confirmation is required')
    }

    if (version === 'default') {
      throw new Error('Cannot delete default version')
    }

    const s3Service = new S3Service(env, walletAddress)
    const existingConfig: ConfigVersions = await s3Service.getJsonFromS3()

    if (existingConfig[version]) {
      delete existingConfig[version]
      await s3Service.putJsonToS3(existingConfig)
    }

    return json(existingConfig)
  } catch (error: any) {
    console.error('Delete config error:', error)

    const message =
      error.message === 'Cannot delete default version'
        ? error.message
        : 'An error occurred when deleting config version'

    return json(
      { error: message },
      {
        status: 500
      }
    )
  }
}
