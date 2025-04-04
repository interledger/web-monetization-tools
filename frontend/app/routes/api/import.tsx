import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3AndParams } from '../../lib/server/s3.server'
import { streamToString } from '../../lib/server/utils.server'
// import { corsHeaders } from '../../lib/server/cors.server'
import { filterDeepProperties } from '../../lib/server/utils.server'
import { getDefaultData } from '../../lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  // if (request.method === 'OPTIONS') {
  //   return new Response(null, { headers: corsHeaders })
  // }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      throw new Error('Wallet address is required')
    }

    console.log('!!!!!!!!!!!!!!!!!!!Fetching config for wallet address:', id)

    //TODO: test this wallet address
    const walletAddress = decodeURIComponent(`https://${id}`)

    const defaultData = getDefaultData()
    const parsedDefaultData = defaultData
    parsedDefaultData.default.walletAddress = walletAddress

    const { s3, params: s3Params } = getS3AndParams(walletAddress)
    try {
      const data = await s3.send(new GetObjectCommand(s3Params))
      const fileContentString = await streamToString(data.Body as NodeJS.ReadableStream)
      
      let fileContent = Object.assign(
        parsedDefaultData,
        ...[JSON.parse(fileContentString)]
      )
      fileContent = filterDeepProperties(fileContent)

      return json(fileContent)
      
    } catch (error: any) {
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
