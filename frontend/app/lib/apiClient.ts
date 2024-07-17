import axios from "axios"
import { getEnv } from "./utils"
import { ElementConfigType } from "./types"

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ApiResponse<T = any> = {
  readonly payload?: T
  readonly isFailure: false | true
  readonly errors?: Array<string>
}

export class ApiClient {
  public static async getDefaultConfig(): Promise<ApiResponse> {
    const apiUrl = getEnv("API_URL")
    const response = await axios.get(`${apiUrl}tools/default`)

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
    walletAddress: string,
    configData: Partial<ElementConfigType>
  ): Promise<ApiResponse> {
    const apiUrl = getEnv("API_URL")

    if (!walletAddress) {
      return {
        errors: [`status 400: wallet address is required`],
        isFailure: true
      }
    }

    const response = await axios.post(`${apiUrl}tools/${walletAddress}`, configData)

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
