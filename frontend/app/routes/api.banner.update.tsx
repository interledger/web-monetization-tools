import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { filterDeepProperties } from '../lib/server/utils.server'
import { sanitizeConfigFields } from '../lib/server/sanitize.server'
import { ConfigVersions } from '../lib/types.js'
import { getSession } from '../lib/server/session.server'
import { S3Service } from '../lib/server/s3.server'

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    return json(
      { error: 'Method not allowed' },
      {
        status: 405
      }
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  try {
    const {
      cloudflare: { env }
    } = context
    const walletAddressValue = formData.get('walletAddress')
    if (walletAddressValue === null) {
      throw new Error('Wallet address is required')
    }

    const data = {
      walletAddress: walletAddressValue,
      fullconfig: JSON.parse(formData.get('fullconfig') as string)
    }
    const validForWallet = session.get('validForWallet')
    if (!data.walletAddress) throw new Error('Wallet address required')
    if (!session || validForWallet !== data.walletAddress) {
      throw new Error('Grant confirmation required')
    }

    let existingConfig: ConfigVersions = {}
    const s3Service = new S3Service(env, data.walletAddress as string)

    try {
      existingConfig = await s3Service.getJsonFromS3()
    } catch (error) {
      // treats new wallets entries with no existing Default config
      // @ts-expect-error TODO: add type for error
      if (error.name !== 'NoSuchKey') throw error
    }

    //TODO: check data.fullconfig for types; ConfigVersions might miss some fields
    const newConfigData: ConfigVersions = data.fullconfig
    Object.keys(newConfigData).forEach((key) => {
      if (typeof newConfigData[key] === 'object') {
        existingConfig[key] = sanitizeConfigFields(newConfigData[key])
      }
    })

    const filteredData = filterDeepProperties(existingConfig)
    await s3Service.putJsonToS3(filteredData)

    return json(existingConfig)
  } catch (error) {
    return json(
      { error: (error as Error).message },
      {
        status: 500
      }
    )
  }
}
