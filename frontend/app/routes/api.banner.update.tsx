import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  filterDeepProperties,
  streamToString
} from '../lib/server/utils.server'
import { sanitizeConfigFields } from '../lib/server/sanitize.server'
import { ConfigVersions, SaveUserConfigRequest } from '../lib/types'
import { getSession } from '../lib/server/session.server'
import { getS3AndParams } from '../lib/server/s3.server'

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    return json(
      { error: 'Method not allowed' },
      {
        status: 405
      }
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  try {
    const { cloudflare : {env} } = context
    const walletAddressValue = formData.get('walletAddress')
    if (walletAddressValue === null) {
      throw new Error('Wallet address is required')
    }

    const data = {
      walletAddress: walletAddressValue,
      fullconfig: JSON.parse(formData.get('fullconfig') as string)
    }
    const validForWallet = session.get('validForWallet')
    if (!data.walletAddress) throw new Error('Wallet address required')
    if (!session || validForWallet !== data.walletAddress) {
      throw new Error('Grant confirmation required')
    }

    const { s3, params } = getS3AndParams(env, data.walletAddress as string)
    let existingConfig: ConfigVersions = {}

    try {
      const existingData = await s3.send(new GetObjectCommand(params))
      const existingContentString = await streamToString(
        existingData.Body as NodeJS.ReadableStream
      )
      existingConfig = JSON.parse(existingContentString)
    } catch (error: any) {
      // treats new wallets entries with no existing Default config
      if (error.name !== 'NoSuchKey') throw error
    }

    //TODO: check data.fullconfig for types; ConfigVersions might miss some fields
    const { fullconfig } = data as SaveUserConfigRequest
    // @ts-ignore
    const newConfigData: ConfigVersions = fullconfig
    Object.keys(newConfigData).forEach((key) => {
      if (typeof newConfigData[key] === 'object') {
        existingConfig[key] = sanitizeConfigFields(newConfigData[key])
      }
    })

    const filteredData = filterDeepProperties(existingConfig)
    const fileContent = JSON.stringify(filteredData)
    const extendedParams = { ...params, Body: fileContent }

    await s3.send(new PutObjectCommand(extendedParams))

    return json(existingConfig)
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
