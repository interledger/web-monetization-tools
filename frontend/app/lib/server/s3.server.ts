import { S3Client } from '@aws-sdk/client-s3'

const s3Client = (env: Env) => new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
})

export function getS3AndParams(env: Env, walletAddress: string) {
  const fileKey = `${decodeURIComponent(walletAddress)
    .replace('$', '')
    .replace('https://', '')}.json`

  const params = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: fileKey
  }

  return { s3: s3Client(env), params }
}
