import { AwsClient } from 'aws4fetch'
import { walletAddressToKey } from './utils.js'
import { Env } from '../index.js'

export class ConfigStorageService {
  private static instance: AwsClient | null = null
  private client: AwsClient
  private endpoint: string

  constructor(env: Env) {
    if (!ConfigStorageService.instance) {
      ConfigStorageService.instance = new AwsClient({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION
      })
    }

    this.client = ConfigStorageService.instance
    this.endpoint = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`
  }

  async getJson<T>(walletAddress: string): Promise<T> {
    const key = walletAddressToKey(walletAddress)
    const url = new URL(key, this.endpoint)

    const response = await this.client.fetch(url)

    if (!response.ok) {
      throw new Error(`S3 request failed with status: ${response.status}`)
    }

    return await response.json()
  }
}
