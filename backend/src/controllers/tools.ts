import sanitizeHtml from 'sanitize-html'
import type { Request, Response } from 'express'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import _ from 'underscore'
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
  SaveUserConfigRequest
} from './types.js'

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

    if (!data.walletAddress) {
      throw 'Wallet address is required'
    }
    const defaultData = await getDefaultData()
    const defaultDataContent = JSON.parse(defaultData).default
    defaultDataContent.walletAddress = decodeURIComponent(
      `https://${data.walletAddress}`
    )

    try {
      sanitizeConfigFields({ ...defaultDataContent, tag })
    } catch (e) {
      throw e
    }

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

    if (!data.walletAddress) {
      throw 'Wallet address is required'
    }

    const { s3, params } = getS3AndParams(data.walletAddress)

    const fullConfig: ConfigVersions = JSON.parse(data?.fullconfig)

    // sanitize all versions/tags in the config
    Object.keys(fullConfig).forEach((key) => {
      try {
        if (typeof fullConfig[key] === 'object') {
          fullConfig[key] = sanitizeConfigFields(fullConfig[key])
        }
      } catch (e) {
        throw e
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

    // ensure we have all keys w default values, user config will overwrite values that exist in saved json
    const defaultData = await getDefaultData()

    const { s3, params } = getS3AndParams(id)
    const data = await s3.send(new GetObjectCommand(params))
    // Convert the file stream to a string
    const fileContentString = await streamToString(
      data.Body as NodeJS.ReadableStream
    )

    let fileContent = Object.assign(
      JSON.parse(defaultData),
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

const sanitizeConfigFields = (config: any) => {
  const fieldsToSanitize = [
    'bannerTitleText',
    'bannerDescriptionText',
    'widgetTitleText',
    'widgetDescriptionText',
    'widgetButtonText',
    'buttonText',
    'buttonDescriptionText',
    'walletAddress',
    'tag',
    'version'
  ]

  for (const field of fieldsToSanitize) {
    if (config[field]) {
      const sanitized = sanitizeHtml(config[field], {
        allowedTags: ['b', 'i', 'em', 'strong']
      })
      if (sanitized !== config[field]) {
        throw new Error(`Invalid HTML in field: ${field}`)
      }
      config[field] = sanitized
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
