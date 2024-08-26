import { z } from "zod"
import { CornerType, SlideAnimationType } from "./types"

export const sharedSchema = z.object({
  walletAddress: z.string().min(1, { message: "Wallet address is required" }),
  fontName: z.string().min(1, { message: "Choose a font" }),
})

export const createButtonSchema = z.object({
  tag: z.literal('button'),
  buttonText: z.string().min(1, { message: "Button label cannot be empty" }),
  buttonBorder: z.nativeEnum(CornerType),
  buttonTextColor: z.string().min(6),
  buttonBackgroundColor: z.string().min(6)
}).merge(sharedSchema)

export const createBannerSchema = z.object({
  tag: z.literal('banner'),
  bannerDescriptionText: z.string().min(1, { message: "Banner text cannot be empty" }),
  bannerTextColor: z.string().min(6),
  bannerBackgroundColor: z.string().min(6),
  bannerSlideAnimation: z.nativeEnum(SlideAnimationType)
}).merge(sharedSchema)

export const createWidgetSchema = z.object({
  tag: z.literal('widget'),
  widgetButtonText: z.string().min(1),
  widgetDescriptionText: z.string().min(1),
  widgetButtonBorder: z.nativeEnum(CornerType),
  widgetButtonBackgroundColor: z.string().min(1),
  widgetButtonTextColor: z.string().min(1),
  widgetTextColor: z.string().min(1), 
  widgetBackgroundColor: z.string().min(1),
}).merge(sharedSchema)

export const getElementSchema = (type: string) => {
  switch (type) {
    case "banner":
      return createBannerSchema
    case "widget":
      return createWidgetSchema
    case "button":
    default:
      return createButtonSchema
  }
}
