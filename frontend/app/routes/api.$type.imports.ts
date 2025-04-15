import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { filterDeepProperties } from '../lib/server/utils.server'
import { getDefaultData } from '../lib/utils.js'
import { S3Service } from '../lib/server/s3.server'
import type { ConfigVersions, ElementConfigType } from '../lib/types.js'

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { env } = context.cloudflare
    const url = new URL(request.url)
    const wa = url.searchParams.get('wa')
    if (!wa) {
      throw new Error('Wallet address is required')
    }
    //TODO: test this wallet address
    const walletAddress = decodeURIComponent(wa)

    const defaultData = { default: { ...getDefaultData() } }
    defaultData.default.walletAddress = walletAddress

    try {
      const s3Service = new S3Service(env)
      const fileContentString: ConfigVersions =
        await s3Service.getJson(walletAddress)

      let fileContent = Object.assign(defaultData, ...[fileContentString])
      fileContent = filterDeepProperties(fileContent) as {
        default: ElementConfigType
      } & ConfigVersions

      return json(fileContent)
    } catch (error) {
      // @ts-expect-error TODO
      if (error.name === 'NoSuchKey') {
        // if no user config exists, return default
        return json(defaultData)
      }
      throw error
    }
  } catch {
    return json(
      { error: 'An error occurred while fetching data' },
      { status: 500 }
    )
  }
}
