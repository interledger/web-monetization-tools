import axios from 'axios'
import https from 'https'
import fs from 'fs'
import { ElementConfigType } from './types.js'
import path from 'path'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ApiResponse<T = any> = {
  readonly payload?: T
  readonly isFailure: false | true
  readonly errors?: Array<string>
  newversion?: false | string
}

const isProd = import.meta.env.PROD
const apiUrl = process.env.API_URL // || 'https://backend:5101/'

let httpsAgent: https.Agent | undefined
if (!isProd) {
  try {
    // Load self-signed certificate
    const backendCert = fs.readFileSync(path.resolve('..', 'certs', 'cert.pem'))

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
    console.log('!!!!!!!!!!!!!!!!!!!!!!getDefaultConfig')
    const response = await axios.get(`/api/tools/default`)

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
    const response = await axios.get(`/api/tools/${wa}`)

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
    const wa = encodeURIComponent(
      walletAddress.replace('$', '').replace('https://', '')
    )

      const response = await axios.delete(`/api/tools/${wa}/${version}`, {
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
    }

      return {
        errors: [`status ${response.status}: ${response.statusText}`],
        isFailure: true
      }
  }
}
