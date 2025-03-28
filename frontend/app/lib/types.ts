import type { z } from 'zod'
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema
} from './server/validate.server.js'

export enum CornerType {
  None = 'None',
  Light = 'Light',
  Pill = 'Pill'
}

export enum SlideAnimationType {
  None = 'None',
  Down = 'Down'
}

export enum PositionType {
  Top = 'Top',
  Bottom = 'Bottom'
}

export interface ElementConfigType {
  walletAddress?: string

  // button specific
  buttonFontName: string
  buttonText: string
  buttonBorder: CornerType
  buttonTextColor: string
  buttonBackgroundColor: string

  // banner specific
  bannerFontName: string
  bannerFontSize: number
  bannerTitleText: string
  bannerDescriptionText: string
  bannerSlideAnimation: SlideAnimationType
  bannerPosition: PositionType
  bannerBorder: CornerType
  bannerTextColor: string
  bannerBackgroundColor: string

  // widget specific
  widgetFontName: string
  widgetFontSize: number
  widgetTitleText: string
  widgetDescriptionText: string
  // widgetDonateAmount: number // not posibble currently
  widgetButtonText: string
  widgetButtonBorder: CornerType
  widgetTextColor: string
  widgetBackgroundColor: string
  widgetButtonTextColor: string
  widgetButtonBackgroundColor: string
  widgetTriggerBackgroundColor: string
  widgetTriggerIcon: string
}

export type JSONError<T extends z.ZodTypeAny> = {
  errors: z.typeToFlattenedError<z.infer<T>>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Keys<T> = T extends any ? keyof T : never

export type ZodFieldErrors<T extends z.ZodTypeAny> = {
  [P in Keys<z.TypeOf<T>>]?: string[] | undefined
}

export type ElementErrors = {
  fieldErrors: ZodFieldErrors<
    | typeof createButtonSchema
    | typeof createBannerSchema
    | typeof createWidgetSchema
  >
  message: string[]
}

export class WalletAddressFormatError extends Error {}

export interface WalletAddress {
  id: string
  assetScale: number
  assetCode: string
  authServer: string
  resourceServer: string
}
