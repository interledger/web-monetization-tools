import type { Request, Response } from 'express'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import _ from 'underscore'
import {
  getDefaultData,
  getS3AndParams,
  streamToString
} from '../services/utils.js'
import { S3FileNotFoundError } from '../services/errors.js'

export const getDefault = async (_: Request, res: Response) => {
  try {
    const data = await getDefaultData()

    res.status(200).send(JSON.parse(data))
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred when fetching data')
  }
}

export const saveUserConfig = async (req: Request, res: Response) => {
  try {
    const data = req.body

    if (!data.walletAddress) {
      throw 'Wallet address is required'
    }

    const { s3, params } = getS3AndParams(data.walletAddress)

    // get defaults, get existing config, then overwrite values
    const defaultData = await getDefaultData()

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
      }
    }

    const changedValues = _.omit(data, function (value, key) {
      return defaultData[key] === value
    })

    const currentData = Object.assign(
      JSON.parse(defaultData),
      JSON.parse(fileContentString)
    )
    const fileContent = JSON.stringify(
      Object.assign(currentData, ...[changedValues])
    )

    const extendedParams = { ...params, Body: fileContent }

    await s3.send(new PutObjectCommand(extendedParams))

    res.status(200).send(data)
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

    const fileContent = Object.assign(
      JSON.parse(defaultData),
      ...[JSON.parse(fileContentString)]
    )

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

export default {
  getDefault,
  getUserConfig,
  saveUserConfig
}
