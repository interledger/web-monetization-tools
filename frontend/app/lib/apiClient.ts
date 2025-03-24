import axios from 'axios'
import https from 'https'
import fs from 'fs'
import { ElementConfigType } from './types.js'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ApiResponse<T = any> = {
  readonly payload?: T
  readonly isFailure: false | true
  readonly errors?: Array<string>
  newversion?: false | string
}

const isProd = import.meta.env.PROD
const apiUrl = process.env.API_URL!

let httpsAgent: https.Agent | undefined

if (!isProd) {
  try {
    // Load self-signed certificate
    const backendCert = fs.readFileSync('/app/certs/cert.pem')

    // Create an HTTPS agent with the certificate
    httpsAgent = isProd
      ? undefined
      : new https.Agent({
          rejectUnauthorized: isProd, // false in dev mode
          ca: backendCert // Add cert to trusted CAs
        })
  } catch (err) {
    console.error('Could not load certificate:', err)
  }
}

export class ApiClient {
  public static async getDefaultConfig(): Promise<ApiResponse> {
    const response = await axios.get(`${apiUrl}tools/default`, { httpsAgent })

    if (response.status === 200) {
      return {
        isFailure: false,
        payload: response.data
      }
    } else {
      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true
      }
    }
  }

  public static async getUserConfig(
    walletAddress: string
  ): Promise<ApiResponse> {
    const wa = encodeURIComponent(
      walletAddress.replace('$', '').replace('https://', '')
    )
    const response = await axios.get(`${apiUrl}tools/${wa}`, {
      httpsAgent
    })

    if (response.status === 200) {
      return {
        isFailure: false,
        payload: response.data
      }
    } else {
      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true
      }
    }
  }

  public static async createUserConfig(
    version: string,
    walletAddress: string,
    cookieHeader: string
  ): Promise<ApiResponse> {
    const tag = encodeURIComponent(version)
    const wa = encodeURIComponent(
      walletAddress.replace('$', '').replace('https://', '')
    )
    const response = await axios.post(
      `${apiUrl}tools`,
      { walletAddress: wa, tag },
      {
        httpsAgent,
        withCredentials: true,
        headers: {
          Cookie: cookieHeader // Manually attach the session cookie
        }
      }
    )

    if (response.status === 200) {
      return {
        isFailure: false,
        payload: response.data
      }
    } else {
      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true,
        newversion: false
      }
    }
  }

  public static async saveUserConfig(
    configData: Partial<ElementConfigType>,
    cookieHeader: string
  ): Promise<ApiResponse> {
    const response = await axios.put(`${apiUrl}tools`, configData, {
      httpsAgent,
      withCredentials: true,
      headers: {
        Cookie: cookieHeader // Manually attach the session cookie
      }
    })

    if (response.status === 200) {
      return {
        isFailure: false,
        payload: response.data
      }
    } else {
      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true
      }
    }
  }

  public static async deleteConfigVersion(
    walletAddress: string,
    version: string,
    cookieHeader: string
  ): Promise<ApiResponse> {
    const wa = encodeURIComponent(walletAddress)
    const response = await axios.delete(`${apiUrl}tools/${wa}/${version}`, {
      httpsAgent,
      withCredentials: true,
      headers: {
        Cookie: cookieHeader
      }
    })

    if (response.status === 200) {
      return {
        isFailure: false,
        payload: response.data
      }
    } else {
      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true
      }
    }
  }
}
