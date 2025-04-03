import { json, type ActionFunctionArgs } from '@remix-run/node'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { filterDeepProperties, streamToString } from '../../lib/server/utils.server'
import { sanitizeConfigFields } from '../../lib/server/sanitize.server'
import { ConfigVersions, CreateConfigRequest, SaveUserConfigRequest } from '../../lib/types'
import { getSession } from '../../lib/server/session.server'
import { getS3AndParams } from '../../lib/server/s3.server'
import { corsHeaders } from '../../lib/server/cors.server'
import { getDefaultData } from '../../lib/server/s3.server'


export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const session = await getSession(request.headers.get('Cookie'))
  const data: CreateConfigRequest|SaveUserConfigRequest = await request.json()

  try {
    switch (request.method) {
      case 'POST': {
        const { walletAddress, tag } = data as CreateConfigRequest
        if (!walletAddress) throw new Error('Wallet address required')

        const validForWallet = session.get('validForWallet')
        if (!session || validForWallet !== walletAddress) {
          throw new Error('Grant confirmation required')
        }

        const defaultData = await getDefaultData()
        const defaultDataContent: ConfigVersions['default'] =
          JSON.parse(defaultData).default
        defaultDataContent.walletAddress = walletAddress

        sanitizeConfigFields({ ...defaultDataContent, tag })

        const { s3, params } = getS3AndParams(data.walletAddress)

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
                status: 500,
                headers: corsHeaders
              }
            )
          }
        }

        let currentData = JSON.parse(fileContentString)
        if (currentData?.default) {
          currentData = Object.assign(filterDeepProperties(currentData), {
            [tag]: defaultDataContent
          })
        } else {
          currentData = Object.assign(
            { default: currentData },
            {
              [tag]: defaultDataContent
            }
          )
        }

        const fileContent = JSON.stringify(currentData)
        const extendedParams = { ...params, Body: fileContent }
        await s3.send(new PutObjectCommand(extendedParams))

        return json(defaultData, { headers: corsHeaders })
      }
      case 'PUT': {
        const validForWallet = session.get('validForWallet')
        if (!data.walletAddress) throw new Error('Wallet address required')
        if (!session || validForWallet !== data.walletAddress) {
          throw new Error('Grant confirmation required')
        }

        const { s3, params } = getS3AndParams(data.walletAddress)
        let existingConfig:ConfigVersions = {}

        try {
          const existingData = await s3.send(new GetObjectCommand(params))
          const existingContentString = await streamToString(existingData.Body as NodeJS.ReadableStream)
          existingConfig = JSON.parse(existingContentString)
        } catch (error: any) {
          if (error.name !== 'NoSuchKey') throw error
        }

        //TODO: check data.fullconfig for types; ConfigVersions might miss some fields
        const { fullconfig } = data as SaveUserConfigRequest
        const newConfigData: ConfigVersions = JSON.parse(fullconfig)
        Object.keys(newConfigData).forEach((key) => {
          if (typeof newConfigData[key] === 'object') {
            existingConfig[key] = sanitizeConfigFields(newConfigData[key])
          }
        })

        const filteredData = filterDeepProperties(existingConfig)
    const fileContent = JSON.stringify(filteredData)
    const extendedParams = { ...params, Body: fileContent }

    await s3.send(new PutObjectCommand(extendedParams))

        return json(existingConfig, { headers: corsHeaders })
      }

      default:
        return json(
          { error: 'Method not allowed' },
          {
            status: 405,
            headers: corsHeaders
          }
        )
    }
  } catch (error) {
    return json(
      { error: (error as Error).message },
      {
        status: 500,
        headers: corsHeaders
      }
    )
  }
}
