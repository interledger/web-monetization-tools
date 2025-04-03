import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { streamToString } from './utils.server'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export function getS3AndParams(walletAddress: string) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${walletAddress}.json`
  }

  return { s3: s3Client, params }
}

export async function getDefaultData() {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: 'default.json'
  }

  const data = await s3Client.send(new GetObjectCommand(params))
  return streamToString(data.Body as NodeJS.ReadableStream)
}
