import axios from "axios"
import https from "https"
import fs from "fs"
import { getEnv } from "./utils"
import { ElementConfigType } from "./types"

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ApiResponse<T = any> = {
  readonly payload?: T
  readonly isFailure: false | true
  readonly errors?: Array<string>
}

const nodeEnv = getEnv("NODE_ENV")

// Load self-signed certificate
const backendCert = fs.readFileSync("/certs/cert.pem")

// Create an HTTPS agent with the certificate
const httpsAgent = new https.Agent({
  rejectUnauthorized: nodeEnv != "development", // false in dev mode
  ca: backendCert // Add cert to trusted CAs
})

export class ApiClient {
  public static async getDefaultConfig(): Promise<ApiResponse> {
    const apiUrl = getEnv("API_URL")
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
    const apiUrl = getEnv("API_URL")
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
