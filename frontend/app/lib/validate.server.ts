import { z } from 'zod'
import { CornerType, PositionType, SlideAnimationType } from './types.js'

const rangeError = { message: 'Value has to be between 16 and 24' }

export const walletSchema = z.object({
  walletAddress: z.string().min(1, { message: 'Wallet address is required' })
})

export const createButtonSchema = z
  .object({
    elementType: z.literal('button'),
    buttonFontName: z.string().min(1, { message: 'Choose a font' }),
    buttonText: z.string().min(1, { message: 'Button label cannot be empty' }),
    buttonBorder: z.nativeEnum(CornerType),
    buttonTextColor: z.string().min(6),
    buttonBackgroundColor: z.string().min(6)
  })
  .merge(walletSchema)

export const createBannerSchema = z
  .object({
    elementType: z.literal('banner'),
    bannerFontName: z.string().min(1, { message: 'Choose a font' }),
    bannerFontSize: z.coerce.number().min(16, rangeError).max(24, rangeError),
    bannerTitleText: z.string().optional(),
    bannerDescriptionText: z
      .string()
      .min(1, { message: 'Banner text cannot be empty' }),
    bannerTextColor: z.string().min(6),
    bannerBackgroundColor: z.string().min(6),
    bannerSlideAnimation: z.nativeEnum(SlideAnimationType),
    bannerPosition: z.nativeEnum(PositionType),
    bannerBorder: z.nativeEnum(CornerType)
  })
  .merge(walletSchema)

export const createWidgetSchema = z
  .object({
    elementType: z.literal('widget'),
    widgetFontName: z.string().min(1, { message: 'Choose a font' }),
    widgetFontSize: z.coerce.number().min(16, rangeError).max(24, rangeError),
    widgetButtonText: z.string().min(1),
    widgetDescriptionText: z.string().min(1),
    widgetButtonBorder: z.nativeEnum(CornerType),
    widgetButtonBackgroundColor: z.string().min(1),
    widgetButtonTextColor: z.string().min(1),
    widgetTextColor: z.string().min(1),
    widgetBackgroundColor: z.string().min(1),
    widgetTriggerBackgroundColor: z.string().min(1),
    widgetTriggerIcon: z.string().optional()
  })
  .merge(walletSchema)

export const getElementSchema = (type: string) => {
  switch (type) {
    case 'banner':
      return createBannerSchema
    case 'widget':
      return createWidgetSchema
    case 'button':
    default:
      return createButtonSchema
  }
}
