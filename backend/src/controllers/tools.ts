import type { Request, Response } from "express"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import {
  getDefaultData,
  getS3AndParams,
  streamToString
} from "../services/tools"
import { S3FileNotFoundError } from "../services/errors"

export const getDefault = async (_: Request, res: Response) => {
  try {
    const data = await getDefaultData()

    res.status(200).send(JSON.parse(data))
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred when fetching data")
  }
}

export const saveUserConfig = async (req: Request, res: Response) => {
  try {
    const data = req.body

    if (!data.walletAddress) {
      throw "Wallet address is required"
    }

    const { s3, params } = getS3AndParams(data.walletAddress)

    // get defaults, then overwrite set values
    const defaultData = await getDefaultData()
    const fileContent = JSON.stringify(
      Object.assign(JSON.parse(defaultData), ...[data])
    )

    const extendedParams = { ...params, Body: fileContent }

    await s3.send(new PutObjectCommand(extendedParams))

    res.status(200).send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred when saving data")
  }
}

export const getUserConfig = async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    if (!id) {
      throw new S3FileNotFoundError("Wallet address is required")
    }

    const { s3, params } = getS3AndParams(id)
    const data = await s3.send(new GetObjectCommand(params))
    // Convert the file stream to a string
    const fileContent = await streamToString(data.Body as NodeJS.ReadableStream)

    res.status(200).send(JSON.parse(fileContent))
  } catch (error) {
    const err = error as Error
    if (err.name === "NoSuchKey") {
      // file / config not found, serve default
      const defaultData = await getDefaultData()
      res.status(200).send(defaultData)
    } else {
      console.log(error)
      res.status(500).send("An error occurred while fetching data")
    }
  }
}

export default {
  getDefault,
  getUserConfig,
  saveUserConfig
}
