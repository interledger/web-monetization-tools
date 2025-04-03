import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { getS3AndParams } from '../../lib/server/s3.server'
import { streamToString } from '../../lib/server/utils.server'
import { corsHeaders } from '../../lib/server/cors.server'
import { getSession } from '../../lib/server/session.server'
import type { ConfigVersions } from '../../lib/types'

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'DELETE') {
    return json(
      { error: 'Method not allowed' },
      {
        status: 405,
        headers: corsHeaders
      }
    )
  }

  try {
    const { walletAddress, version } = params
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

    const { s3, params: s3Params } = getS3AndParams(walletAddress)
    const existingData = await s3.send(new GetObjectCommand(s3Params))
    const existingContentString = await streamToString(existingData.Body as NodeJS.ReadableStream)
    const existingConfig: ConfigVersions = JSON.parse(existingContentString)

    // Delete version if exists
    if (existingConfig[version]) {
      delete existingConfig[version]

      // Save updated config
      await s3.send(
        new PutObjectCommand({
          ...s3Params,
          Body: JSON.stringify(existingConfig)
        })
      )
    }

    return json(existingConfig, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Delete config error:', error)

    const message =
      error.message === 'Cannot delete default version'
        ? error.message
        : 'An error occurred when deleting config version'

    return json(
      { error: message },
      {
        status: 500,
        headers: corsHeaders
      }
    )
  }
}
