import sanitizeHtml from 'sanitize-html'
import type { Request, Response } from 'express'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import _ from 'underscore'
import he from 'he'
import {
  filterDeepProperties,
  getDefaultData,
  getS3AndParams,
  streamToString
} from '../services/utils.js'
import { S3FileNotFoundError } from '../services/errors.js'
import {
  ConfigVersions,
  CreateConfigRequest,
  SanitizedFields,
  SaveUserConfigRequest
} from './types.js'
import { getSession } from '@/services/session.js'

export const getDefault = async (_: Request, res: Response) => {
  try {
    const data = await getDefaultData()

    res.status(200).send(JSON.parse(data))
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred when fetching data')
  }
}

export const createUserConfig = async (req: Request, res: Response) => {
  try {
    const data: CreateConfigRequest = req.body
    const tag = data.version || data.tag

    if (!data?.walletAddress) {
      throw 'Wallet address is required'
    }
    const walletAddress = decodeURIComponent(`https://${data.walletAddress}`)

    const cookieHeader = req.headers.cookie
    const session = await getSession(cookieHeader)

    const validForWallet = session?.get('validForWallet')

    if (!session || validForWallet !== walletAddress) {
      throw 'Grant confirmation is required'
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

      // Convert the file stream to a string
      fileContentString = await streamToString(
        s3data.Body as NodeJS.ReadableStream
      )
    } catch (error) {
      const err = error as Error
      if (err.name === 'NoSuchKey') {
        // file / config not found, continue with defaults
      } else {
        console.log(error)
        res.status(500).send('An error occurred while fetching data')
        return
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

    // save json to file
    await s3.send(new PutObjectCommand(extendedParams))

    res.status(200).send(currentData)
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred when fetching data')
  }
}

export const saveUserConfig = async (req: Request, res: Response) => {
  try {
    const data: SaveUserConfigRequest = req.body
    const cookieHeader = req.headers.cookie
    const session = await getSession(cookieHeader)

    const validForWallet = session?.get('validForWallet')

    if (!data.walletAddress) {
      throw 'Wallet address is required'
    }
    if (!session || validForWallet !== data.walletAddress) {
      throw 'Grant confirmation is required'
    }

    const { s3, params } = getS3AndParams(data.walletAddress)

    const fullConfig: ConfigVersions = JSON.parse(data?.fullconfig)

    // sanitize all versions/tags in the config
    Object.keys(fullConfig).forEach((key) => {
      if (typeof fullConfig[key] === 'object') {
        fullConfig[key] = sanitizeConfigFields(fullConfig[key])
      }
    })

    const filteredData = filterDeepProperties(fullConfig)
    const fileContent = JSON.stringify(filteredData)
    const extendedParams = { ...params, Body: fileContent }

    await s3.send(new PutObjectCommand(extendedParams))
    res.status(200).send(filteredData)
  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred when saving data')
  }
}

export const getUserConfig = async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    if (!id) {
      throw new S3FileNotFoundError('Wallet address is required')
    }
    const walletAddress = decodeURIComponent(`https://${id}`)

    // ensure we have all keys w default values, user config will overwrite values that exist in saved json
    const defaultData = await getDefaultData()
    const parsedDefaultData = JSON.parse(defaultData)
    parsedDefaultData.default.walletAddress = walletAddress

    const { s3, params } = getS3AndParams(walletAddress)
    const data = await s3.send(new GetObjectCommand(params))
    // Convert the file stream to a string
    const fileContentString = await streamToString(
      data.Body as NodeJS.ReadableStream
    )

    let fileContent = Object.assign(
      parsedDefaultData,
      ...[JSON.parse(fileContentString)]
    )
    fileContent = filterDeepProperties(fileContent)

    res.status(200).send(fileContent)
  } catch (error) {
    const err = error as Error
    if (err.name === 'NoSuchKey') {
      // file / config not found, serve default
      const defaultData = await getDefaultData()
      res.status(200).send(defaultData)
    } else {
      console.log(error)
      res.status(500).send('An error occurred while fetching data')
    }
  }
}

export const getUserConfigByTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const tag = req.params.tag ?? 'default'

    if (!id) {
      throw new S3FileNotFoundError('Wallet address is required')
    }

    // ensure we have all keys w default values, user config will overwrite values that exist in saved json
    const defaultDataResp = await getDefaultData()
    const defaultData = JSON.parse(defaultDataResp)?.default

    const { s3, params } = getS3AndParams(id)
    const data = await s3.send(new GetObjectCommand(params))
    // Convert the file stream to a string
    const fileContentString = await streamToString(
      data.Body as NodeJS.ReadableStream
    )

    const userConfig = JSON.parse(fileContentString)
    const selectedConfig = userConfig[tag] ?? defaultData
    const fileContent = Object.assign(defaultData, ...[selectedConfig])

    res.status(200).send(fileContent)
  } catch (error) {
    const err = error as Error
    if (err.name === 'NoSuchKey') {
      // file / config not found, serve default
      const defaultData = await getDefaultData()
      res.status(200).send(defaultData)
    } else {
      console.log(error)
      res.status(500).send('An error occurred while fetching data')
    }
  }
}

const sanitizeConfigFields = <T extends Partial<SanitizedFields>>(
  config: T
): T => {
  const textFields: Array<keyof SanitizedFields> = [
    'bannerTitleText',
    'widgetTitleText',
    'widgetButtonText',
    'buttonText',
    'buttonDescriptionText',
    'walletAddress',
    'tag',
    'version'
  ]

  const htmlFields: Array<keyof SanitizedFields> = [
    'bannerDescriptionText',
    'widgetDescriptionText'
  ]

  for (const field of textFields) {
    const value = config[field]
    if (typeof value === 'string' && value) {
      const decoded = he.decode(value)
      const sanitizedText = sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
        textFilter(text) {
          return he.decode(text)
        }
      })
      if (sanitizedText !== decoded) {
        throw new Error(`HTML not allowed in field: ${field}`)
      }

      config[field] = sanitizedText
    }
  }

  for (const field of htmlFields) {
    if (typeof config[field] === 'string' && config[field]) {
      const decoded = he.decode(config[field].replace(/&nbsp;/g, '').trim())
      const sanitizedHTML = sanitizeHtml(decoded, {
        allowedTags: [],
        allowedAttributes: {},
        allowProtocolRelative: false
      })
      const decodedSanitized = he.decode(sanitizedHTML)
      // compare decoded versions to check for malicious content
      if (decodedSanitized !== decoded) {
        throw new Error(`Invalid HTML in field: ${field}`)
      }

      config[field] = decodedSanitized
    }
  }
  return config
}

export default {
  getDefault,
  getUserConfig,
  createUserConfig,
  saveUserConfig
}
