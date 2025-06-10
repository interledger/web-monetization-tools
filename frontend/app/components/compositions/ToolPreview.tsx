import { cx } from 'class-variance-authority'
import { useEffect, useRef, useState } from 'react'
import { bgColors } from '~/lib/presets.js'
import {
  PositionType,
  SlideAnimationType,
  type ElementConfigType
} from '~/lib/types.js'
import { generateConfigCss, getWebMonetizationLink } from '~/lib/utils.js'
import { NotFoundConfig } from '../index.js'
import eyeSvg from '~/assets/images/eye.svg'
import type { PaymentConfig } from '@web-monetization-tools/components'

const ButtonConfig = ({ config }: { config: ElementConfigType }) => {
  return (
    <button className="wm_button" onClick={(e) => console.log(e)}>
      {config.buttonText || '?'}
    </button>
  )
}

const BannerConfig = ({ config }: { config: ElementConfigType }) => {
  const [animated, setAnimated] = useState(
    config.bannerSlideAnimation != SlideAnimationType.None
  )
  const [position, setPosition] = useState(PositionType.Bottom)
  const [triggerAnimation, setTriggerAnimation] = useState(false)
  const [extensionLink, setExtensionLink] = useState('')

  useEffect(() => {
    setAnimated(config.bannerSlideAnimation != SlideAnimationType.None)
    setPosition(config.bannerPosition)
  }, [config])

  useEffect(() => {
    const link = getWebMonetizationLink()
    setExtensionLink(link)
  }, [])

  return (
    <div className="min-h-40">
      {animated && (
        <div className="flex justify-end -mt-5 mb-1">
          <img
            onMouseEnter={() => setTriggerAnimation(true)}
            onMouseLeave={() => setTriggerAnimation(false)}
            className="cursor-progress"
            src={eyeSvg}
            alt="check"
          />
        </div>
      )}
      <div
        className={cx(
          'flex min-h-40',
          position == PositionType.Bottom && 'items-end'
        )}
      >
        <div
          className={cx(
            'wm_banner',
            position == PositionType.Bottom && 'bottom',
            animated && triggerAnimation && 'animate'
          )}
        >
          {config.bannerTitleText && (
            <h5 className="flex flex-row flex-wrap justify-between">
              {config.bannerTitleText}
              <span className="cursor-pointer text-sm">x</span>
            </h5>
          )}
          <span className="w-full my-2">{config.bannerDescriptionText}</span>
          <span
            className="_wm_link underline cursor-pointer"
            dangerouslySetInnerHTML={{ __html: extensionLink }}
          ></span>
        </div>
      </div>
    </div>
  )
}

const WidgetConfig = ({
  config,
  openWidget,
  setOpenWidget
}: {
  config: ElementConfigType
  openWidget: boolean
  setOpenWidget: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [widgetOpen, setWidgetOpen] = useState(false)
  const widgetRef = useRef<HTMLElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadWidgetComponent = async () => {
      try {
        // dynamic import - ensure component only runs on the client side and not on SSR
        await import('@web-monetization-tools/components/payments/widget')
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load component:', error)
      }
    }

    loadWidgetComponent()
  }, [])

  useEffect(() => {
    if (widgetRef.current) {
      const widget = widgetRef.current

      widget.requestQuote = false
      widget.requestPayment = false
      widget.config = {
        walletAddress: '',
        receiverAddress: config.walletAddress || '',
        amount: '1.00',
        currency: 'usd',
        action: config.widgetButtonText || 'Pay',
        note: '',
        widgetTitleText: config.widgetTitleText,
        widgetDescriptionText: config.widgetDescriptionText,
        widgetTriggerIcon: config.widgetTriggerIcon
      } as PaymentConfig
    }
  }, [config])

  useEffect(() => {
    if (openWidget) {
      setWidgetOpen(true)
    }
  }, [openWidget, widgetOpen])

  useEffect(() => {
    if (!widgetOpen) {
      setOpenWidget(false)
    }
  }, [widgetOpen])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <wm-payment-widget
      ref={widgetRef}
      style={{
        '--wm-primary-color': config.widgetButtonBackgroundColor,
        '--wm-background-color': config.widgetBackgroundColor,
        '--wm-text-color': config.widgetTextColor,
        '--wm-font-family': config.widgetFontName,
        '--wm-widget-trigger-bg-color': config.widgetTriggerBackgroundColor
      }}
    ></wm-payment-widget>
  )
}

const RenderElementConfig = ({
  type,
  toolConfig,
  openWidget,
  setOpenWidget
}: {
  type: string
  toolConfig: ElementConfigType
  openWidget: boolean
  setOpenWidget: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  switch (type) {
    case 'button':
      return <ButtonConfig config={toolConfig} />
    case 'banner':
      return <BannerConfig config={toolConfig} />
    case 'widget':
      return (
        <WidgetConfig
          config={toolConfig}
          openWidget={openWidget}
          setOpenWidget={setOpenWidget}
        />
      )
    default:
      return <NotFoundConfig />
  }
}

type ToolPreviewProps = {
  type?: string
  toolConfig: ElementConfigType
  openWidget?: boolean
  setOpenWidget: React.Dispatch<React.SetStateAction<boolean>>
}

export const ToolPreview = ({
  type,
  toolConfig,
  openWidget,
  setOpenWidget
}: ToolPreviewProps) => {
  const bgColor = bgColors[type as keyof typeof bgColors] ?? bgColors.button

  return (
    <div
      className={cx(
        'flex justify-center px-4 py-8 pt-12 rounded-t-lg bg-gradient-to-r',
        bgColor
      )}
    >
      {generateConfigCss(toolConfig)}
      <RenderElementConfig
        type={type ?? ''}
        toolConfig={toolConfig}
        openWidget={openWidget ?? false}
        setOpenWidget={setOpenWidget}
      />
    </div>
  )
}
