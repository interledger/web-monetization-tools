import { cx } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { bgColors } from '~/lib/presets.js'
import {
  ElementConfigType,
  PositionType,
  SlideAnimationType
} from '~/lib/types.js'
import {
  encodeAndCompressParameters,
  generateConfigCss,
  getWebMonetizationLink
} from '~/lib/utils.js'
import { WidgetFooter } from '../WidgetFooter.js'

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
            src={`/images/eye.svg`}
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
  setOpenWidget,
  ilpayUrl
}: {
  config: ElementConfigType
  openWidget: boolean
  setOpenWidget: React.Dispatch<React.SetStateAction<boolean>>
  ilpayUrl: string
}) => {
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    ;(async () => {
      const configCss = generateConfigCss(config, true)
      const css = await encodeAndCompressParameters(String(configCss))
      const iframeSrc = `${ilpayUrl}?amount=1&action=${encodeURI(
        config.widgetButtonText
      )}&receiver=${encodeURI(config.walletAddress || '')}&css=${css}`
      setIframeUrl(iframeSrc)
    })()
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

  return (
    <div className="flex flex-col items-end wm_widget">
      <div
        className={cx(
          'content flex flex-col w-96 h-148 overflow-hidden border border-white-300 transition-all ease-in-out duration-1000 rounded-md p-1 focus:outline-none',
          widgetOpen
            ? 'max-w-96 max-h-148 opacity-1'
            : 'max-w-0 max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-col h-auto w-full">
          <h5>{config?.widgetTitleText}</h5>
          <p>{config?.widgetDescriptionText}</p>
        </div>
        <div className="flex h-full overflow-hidden">
          <iframe
            id="ilpay_iframe"
            className="h-full w-full overflow-hidden"
            src={iframeUrl}
          />
        </div>
        <WidgetFooter />
      </div>
      <div
        onClick={() => setWidgetOpen(!widgetOpen)}
        className="trigger cursor-pointer w-14 h-14 flex items-center justify-center mt-4 border-transparent rounded-full"
      >
        <img
          className="w-8"
          src={`/images/wm_logo_animated.svg`}
          alt="widget trigger"
        />
      </div>
    </div>
  )
}

const NotFoundConfig = () => {
  return <div>This is not a valid option</div>
}

const RenderElementConfig = ({
  type,
  toolConfig,
  openWidget,
  setOpenWidget,
  ilpayUrl
}: {
  type: string
  toolConfig: ElementConfigType
  openWidget: boolean
  setOpenWidget: React.Dispatch<React.SetStateAction<boolean>>
  ilpayUrl: string
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
          ilpayUrl={ilpayUrl}
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
  ilpayUrl: string
}

export const ToolPreview = ({
  type,
  toolConfig,
  openWidget,
  setOpenWidget,
  ilpayUrl
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
        ilpayUrl={ilpayUrl}
      />
    </div>
  )
}
