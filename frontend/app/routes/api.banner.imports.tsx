import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { filterDeepProperties } from '../lib/server/utils.server'
import { getDefaultData } from '../lib/utils'
import { S3Service } from '../lib/server/s3.server'
import { ConfigVersions, ElementConfigType } from '~/lib/types'

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const {
      cloudflare: { env }
    } = context
    const url = new URL(request.url)
    const wa = url.searchParams.get('wa')
    if (!wa) {
      throw new Error('Wallet address is required')
    }
    //TODO: test this wallet address
    const walletAddress = decodeURIComponent(wa)

    const defaultData = getDefaultData()
    const parsedDefaultData = defaultData
    parsedDefaultData.default.walletAddress = walletAddress

    try {
      const s3Service = new S3Service(env, walletAddress)
      const fileContentString: ConfigVersions = await s3Service.getJsonFromS3()

      let fileContent = Object.assign(parsedDefaultData, ...[fileContentString])
      fileContent = filterDeepProperties(fileContent) as {
        default: ElementConfigType
      } & ConfigVersions

      return json(fileContent)
    } catch (error) {
      //@ts-ignore
      if (error.name === 'NoSuchKey') {
        // if no user config exists, return default
        return json(parsedDefaultData)
      }
      throw error
    }
  } catch (error) {
    return json(
      { error: 'An error occurred while fetching data' },
      { status: 500 }
    )
  }
}
