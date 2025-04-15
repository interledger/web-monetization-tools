import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { streamToJson, walletAddressToKey } from './utils.server'

export class S3Service {
  private static instance: S3Client | null = null
  private client: S3Client
  private bucketName: string

  constructor(env: Env) {
    // Use singleton pattern for S3 client
    if (!S3Service.instance) {
      S3Service.instance = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        }
      })
    }

    this.client = S3Service.instance
    this.bucketName = env.AWS_BUCKET_NAME
  }

  async getJson<T>(walletAddress: string): Promise<T> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: walletAddressToKey(walletAddress)
      })

      const response = await this.client.send(command)
      const s3Stream = response.Body
      if (!s3Stream) {
        throw new Error('No stream returned from S3')
      }

      return await streamToJson<T>(s3Stream as ReadableStream)
    } catch (error) {
      console.error('Error reading JSON from S3:', error)
      throw error
    }
  }

  async putJson<T>(walletAddress: string, data: T): Promise<void> {
    const jsonString = JSON.stringify(data)
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: walletAddressToKey(walletAddress),
      Body: jsonString
    })
    await this.client.send(command)
  }
}
