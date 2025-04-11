import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3AndParams } from '../lib/server/s3.server'
import { streamToString } from '../lib/server/utils.server'
import { filterDeepProperties } from '../lib/server/utils.server'
import { getDefaultData } from '../lib/utils'

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { cloudflare : {env} } = context
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

    const { s3, params: s3Params } = getS3AndParams(env, walletAddress)
    try {
      const data = await s3.send(new GetObjectCommand(s3Params))
      const fileContentString = await streamToString(
        data.Body as NodeJS.ReadableStream
      )

      let fileContent = Object.assign(
        parsedDefaultData,
        ...[JSON.parse(fileContentString)]
      )
      fileContent = filterDeepProperties(fileContent)

      return json(fileContent)
    } catch (error: any) {
      console.log('Error fetching config:', error)
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
