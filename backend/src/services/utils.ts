import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { S3Client } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url))

export const getS3AndParams = (walletAddress: string) => {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    maxAttempts: Number(process.env.AWS_RETRY_MAX_ATTEMPTS || 1),
    requestHandler: new NodeHttpHandler({
      connectionTimeout: Number(process.env.AWS_RETRY_TIMEOUT || 3000) // Set timeout (in milliseconds)
    })
  })

  const fileKey = `${walletAddress
    .replace('$', '')
    .replace('https://', '')}.json`

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey
  }

  return { s3, params }
}

export const getDefaultData = async () => {
  const defaultDataPath = join(__dirname, '../data/default_config.json')
  const data = await fs.readFile(defaultDataPath, {
    encoding: 'utf8'
  })
  return data
}

// Function to convert a stream to a string
export const streamToString = (
  readableStream: NodeJS.ReadableStream
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    readableStream.on('data', (chunk) => chunks.push(chunk))
    readableStream.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf-8'))
    )
    readableStream.on('error', reject)
  })
}
