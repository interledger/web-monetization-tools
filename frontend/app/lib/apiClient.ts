import axios from "axios"
import https from "https"
import fs from "fs"
import { ElementConfigType } from "./types"

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ApiResponse<T = any> = {
  readonly payload?: T
  readonly isFailure: false | true
  readonly errors?: Array<string>
}

const isProd = import.meta.env.PROD 
const apiUrl = isProd
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_INTERNAL_API_URL // internal because docker issues

// Load self-signed certificate
const backendCert = fs.readFileSync("/certs/cert.pem")

// Create an HTTPS agent with the certificate
const httpsAgent = isProd
  ? undefined
  : new https.Agent({
      rejectUnauthorized: isProd, // false in dev mode
      ca: backendCert // Add cert to trusted CAs
    })

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

  public static async saveUserConfig(
    configData: Partial<ElementConfigType>
  ): Promise<ApiResponse> {
    const response = await axios.post(`${apiUrl}tools`, configData, {
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
}
