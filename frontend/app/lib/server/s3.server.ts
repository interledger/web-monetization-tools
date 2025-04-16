import { AwsClient } from 'aws4fetch'
import { walletAddressToKey } from './utils.server'

export class S3Service {
  private static instance: AwsClient | null = null
  private client: AwsClient
  private bucketName: string
  private region: string

  constructor(env: Env) {
    if (!S3Service.instance) {
      S3Service.instance = new AwsClient({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION
      })
    }

    this.client = S3Service.instance
    this.bucketName = env.AWS_BUCKET_NAME
    this.region = env.AWS_REGION
  }

  async getJson<T>(walletAddress: string): Promise<T> {
    const key = walletAddressToKey(walletAddress)
    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`

    const response = await this.client.fetch(url)

    if (!response.ok) {
      throw new Error(`S3 request failed with status: ${response.status}`)
    }

    return await response.json()
  }

  async putJson<T>(walletAddress: string, data: T): Promise<void> {
    const key = walletAddressToKey(walletAddress)
    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
    const jsonString = JSON.stringify(data)

    const response = await this.client.fetch(url, {
      method: 'PUT',
      body: jsonString,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.status}`)
    }
  }
}
