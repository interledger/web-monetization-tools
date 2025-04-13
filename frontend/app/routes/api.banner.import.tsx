import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { S3Service } from '../lib/server/s3.server'
import { getDefaultData } from '../lib/utils'
import { ConfigVersions } from '../lib/types'

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const {
      cloudflare: { env }
    } = context
    const url = new URL(request.url)
    const wa = url.searchParams.get('wa')
    const version = url.searchParams.get('version') || 'default'
    if (!wa) {
      throw new Error('Wallet address is required')
    }

    const defaultDataResp = getDefaultData()
    const defaultData = defaultDataResp.default

    const s3Service = new S3Service(env, wa)

    const userConfig: ConfigVersions = await s3Service.getJsonFromS3()
    const selectedConfig = userConfig[version] ?? defaultData
    const fileContent = Object.assign(defaultData, [selectedConfig])

    return json(fileContent)
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      const defaultData = getDefaultData()
      return json(defaultData)
    }
    return json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}
