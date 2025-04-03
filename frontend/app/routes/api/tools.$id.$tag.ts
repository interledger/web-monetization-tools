import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3AndParams, getDefaultData } from '../../lib/server/s3.server'
import { streamToString } from '../../lib/server/utils.server'
import { corsHeaders } from '../../lib/server/cors.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { id, tag = 'default' } = params
    if (!id) throw new Error('Wallet address is required')

    const defaultDataResp = await getDefaultData()
    const defaultData = JSON.parse(defaultDataResp)?.default

    const { s3, params: s3Params } = getS3AndParams(id)
    const data = await s3.send(new GetObjectCommand(s3Params))
    const fileContentString = await streamToString(data.Body as NodeJS.ReadableStream)

    const userConfig = JSON.parse(fileContentString)
    const selectedConfig = userConfig[tag] ?? defaultData
    const fileContent = Object.assign(defaultData, [selectedConfig])

    return json(fileContent, { headers: corsHeaders })
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      const defaultData = await getDefaultData()
      return json(JSON.parse(defaultData), { headers: corsHeaders })
    }
    return json(
      { error: 'Failed to fetch config' },
      {
        status: 500,
        headers: corsHeaders
      }
    )
  }
}
