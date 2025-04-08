import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export function getS3AndParams(walletAddress: string) {
  const fileKey = `${decodeURIComponent(walletAddress)
    .replace('$', '')
    .replace('https://', '')}.json`

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey
  }

  return { s3: s3Client, params }
}
