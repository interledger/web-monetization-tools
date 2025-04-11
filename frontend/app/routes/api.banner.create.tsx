import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  filterDeepProperties,
  streamToString
} from '../lib/server/utils.server'
import { sanitizeConfigFields } from '../lib/server/sanitize.server'
import { ConfigVersions } from '../lib/types'
import { getSession } from '../lib/server/session.server'
import { getS3AndParams } from '../lib/server/s3.server'
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
    const { cloudflare : {env} } = context
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

    const { s3, params } = getS3AndParams(env, walletAddress)

    let fileContentString = '{}'
    try {
      // existing config
      const s3data = await s3.send(new GetObjectCommand(params))
      fileContentString = await streamToString(
        s3data.Body as NodeJS.ReadableStream
      )
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

    let currentData = JSON.parse(fileContentString)
    if (currentData?.default) {
      if (currentData[version]) {
        return json(
          { errors: { fieldErrors: { version: 'Version already exists' } } },
          {
            status: 500
          }
        )
      }
      currentData = Object.assign(filterDeepProperties(currentData), {
        [version]: defaultDataContent
      })
    } else {
      currentData = Object.assign(
        { default: currentData },
        {
          [version]: defaultDataContent
        }
      )
    }

    const fileContent = JSON.stringify(currentData)
    const extendedParams = { ...params, Body: fileContent }
    await s3.send(new PutObjectCommand(extendedParams))
    return json(currentData)
  } catch (error) {
    console.log(error)
    return json(
      { error: (error as Error).message },
      {
        status: 500
      }
    )
  }
}
