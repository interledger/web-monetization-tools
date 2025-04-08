import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3AndParams } from '../lib/server/s3.server'
import { streamToString } from '../lib/server/utils.server'
import { getDefaultData } from '../lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url)
    const wa = url.searchParams.get('wa')
    const version = url.searchParams.get('version') || 'default'
    if (!wa) {
      throw new Error('Wallet address is required')
    }

    const defaultDataResp = getDefaultData()
    const defaultData = defaultDataResp.default

    const { s3, params: s3Params } = getS3AndParams(wa)
    const data = await s3.send(new GetObjectCommand(s3Params))
    const fileContentString = await streamToString(
      data.Body as NodeJS.ReadableStream
    )

    const userConfig = JSON.parse(fileContentString)
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
