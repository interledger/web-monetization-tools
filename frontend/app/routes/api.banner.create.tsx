import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { filterDeepProperties } from '../lib/server/utils.server'
import { sanitizeConfigFields } from '../lib/server/sanitize.server'
import { ConfigVersions } from '../lib/types'
import { getSession } from '../lib/server/session.server'
import { S3Service } from '../lib/server/s3.server'
import { getDefaultData } from '../lib/utils'

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json(
      { error: 'Method not allowed' },
      {
        status: 405
      }
    )
  }

  const formData = await request.formData()
  try {
    const {
      cloudflare: { env }
    } = context
    const walletAddress = formData.get('walletAddress') as string
    const version = formData.get('version') as string

    if (!walletAddress) {
      throw new Error('Wallet address required')
    }
    if (!version) {
      throw new Error('Version required')
    }
    const session = await getSession(request.headers.get('Cookie'))

    const validForWallet = session.get('validForWallet')
    if (!session || validForWallet !== walletAddress) {
      throw new Error('Grant confirmation required')
    }

    const defaultData = getDefaultData()
    const defaultDataContent: ConfigVersions['default'] = (defaultData as any)
      .default
    defaultDataContent.walletAddress = walletAddress

    sanitizeConfigFields({ ...defaultDataContent, version })

    const s3Service = new S3Service(env, walletAddress)
    let configs: ConfigVersions = {}
    try {
      configs = await s3Service.getJsonFromS3()
    } catch (error) {
      const err = error as Error
      if (err.name === 'NoSuchKey') {
        // file / config not found, continue with defaults
      } else {
        return json(
          { error: 'An error occurred while fetching data' },
          {
            status: 500
          }
        )
      }
    }

    if (configs.default) {
      if (configs[version]) {
        return json(
          { errors: { fieldErrors: { version: 'Version already exists' } } },
          {
            status: 500
          }
        )
      }
      configs = Object.assign(filterDeepProperties(configs), {
        [version]: defaultDataContent
      })
    } else {
      configs = Object.assign(
        { default: configs },
        {
          [version]: defaultDataContent
        }
      )
    }

    await s3Service.putJsonToS3(configs)
    return json(configs)
  } catch (error) {
    return json(
      { error: (error as Error).message },
      {
        status: 500
      }
    )
  }
}
