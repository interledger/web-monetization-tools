import { cx } from 'class-variance-authority'
import { useEffect, useState, useRef } from 'react'
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
import { WidgetFooter, NotFoundConfig } from '../index.js'

const ButtonConfig = ({ config, ilPayUrl }: { config: ElementConfigType, ilPayUrl: string }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const shouldShowTooltip = 
    config.buttonTooltip !== '0' && 
    !!config.buttonDescriptionText.length && 
    (config.buttonTooltip === '1' || (config.buttonTooltip === '2' && showTooltip));

  // generate iframe URL when config changes
  useEffect(() => {
    ;(async () => {
      const configCss = generateConfigCss(config, true)
      const css = await encodeAndCompressParameters(String(configCss))
      const iframeSrc = `${ilPayUrl}?amount=1&action=${encodeURI(
        config.buttonText || 'Donate'
      )}&receiver=${encodeURI(config.walletAddress || '')}&css=${css}`
      setIframeUrl(iframeSrc)
    })()
  }, [config])

  return (
    <>
      <div 
        className="button-container relative inline-flex"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button 
          type="button" 
          className="wm_button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOverlayOpen(true);
          }}
        >
          {config.buttonText || '?'}
        </button>

        {shouldShowTooltip && (
          <div className="button-tooltip-wrapper">
            <span className="block whitespace-nowrap overflow-hidden text-ellipsis">{config.buttonDescriptionText}</span>
            <div className="button-tooltip-arrow"></div>
          </div>
        )}
      </div>

      {/* overlay preview - always rendered but conditionally visible */}
      <div 
        className={cx(
          'button-overlay-preview fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300',
          overlayOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <div 
          className="overlay-backdrop absolute inset-0 bg-black bg-opacity-70 transition-opacity duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOverlayOpen(false);
          }}
        ></div>
        
        <div className="overlay-content bg-white rounded-lg shadow-xl max-h-[90vh] relative z-10 overflow-hidden flex flex-col transition-transform duration-300 scale-100">
          <div className="overlay-header flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">{config.buttonText || 'Donate'}</h3>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOverlayOpen(false);
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="overlay-body p-3 px-5 flex-1 overflow-auto relative">
            <iframe
              ref={iframeRef}
              id="button_ilpay_iframe"
              className="overflow-hidden min-h-[30rem]"
              src={iframeUrl}
              title="Payment Preview"
              loading="eager"
            />
          </div>
          
          <div className="overlay-footer px-5 pb-3 border-t">
            <WidgetFooter />
          </div>
        </div>
      </div>
    </>
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

  const triggerIcon = config?.widgetTriggerIcon
    ? config?.widgetTriggerIcon
    : `/images/wm_logo_animated.svg`

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
          <p className="max-h-32 overflow-hidden">
            {config?.widgetDescriptionText}
          </p>
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
        <img className="w-8" src={triggerIcon} alt="widget trigger" />
      </div>
    </div>
  )
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
      return <ButtonConfig config={toolConfig} ilPayUrl={ilpayUrl} />
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
