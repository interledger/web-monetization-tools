import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3AndParams, getDefaultData } from '../../lib/server/s3.server'
import { streamToString } from '../../lib/server/utils.server'
import { corsHeaders } from '../../lib/server/cors.server'
import { filterDeepProperties } from '../../lib/server/utils.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { id } = params
    if (!id) {
      throw new Error('Wallet address is required')
    }

    //TODO: test this wallet address
    const walletAddress = decodeURIComponent(`https://${id}`)

    const defaultData = await getDefaultData()
    const parsedDefaultData = JSON.parse(defaultData)
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

      return json(fileContent, { headers: corsHeaders })
      
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        // if no user config exists, return default
        return json(parsedDefaultData, { headers: corsHeaders })
      }
      throw error
    }

  } catch (error) {
    return json(
      { error: 'An error occurred while fetching data' },
      { status: 500, headers: corsHeaders }
    )
  }
}
