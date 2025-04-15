import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { S3Service } from '../lib/server/s3.server'
import { getDefaultData } from '../lib/utils.js'
import type { ConfigVersions } from '../lib/types.js'

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { env } = context.cloudflare
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
  } catch (error) {
    // @ts-expect-error TODO: add type for error
    if (error.name === 'NoSuchKey') {
      const defaultData = getDefaultData()
      return json(defaultData)
    }
    return json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}
