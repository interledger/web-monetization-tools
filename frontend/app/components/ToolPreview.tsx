import Tippy from '@tippyjs/react'
import { cx } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { bgColors } from '~/lib/presets'
import { ElementConfigType, SlideAnimationType } from '~/lib/types'
import {
  encodeAndCompressParameters,
  generateConfigCss,
  getWebMonetizationLink
} from '~/lib/utils'
import { WidgetFooter } from './WidgetFooter'

const ButtonConfig = ({ config }: { config: ElementConfigType }) => {
  const [canRenderTooltip, setCanRenderConfig] = useState(false)

  useEffect(() => {
    setCanRenderConfig(false)
    setTimeout(() => {
      setCanRenderConfig(true)
    }, 500)
  }, [config.buttonTooltip])

  useEffect(() => {
    setCanRenderConfig(true)
  }, [])

  return (
    <>
      {canRenderTooltip ? (
        <Tippy
          visible={
            config.buttonTooltip == '2'
              ? undefined
              : config.buttonTooltip != '0' &&
                !!config.buttonDescriptionText.length
          }
          className='button-tippy-wrapper'
          content={<span>{config.buttonDescriptionText}</span>}
        >
          <button
            type='button'
            className='wm_button'
          >
            {config.buttonText || '?'}
          </button>
        </Tippy>
      ) : (
        <button
          type='button'
          className='wm_button'
        >
          {config.buttonText || '?'}
        </button>
      )}
    </>
  )
}

const BannerConfig = ({ config }: { config: ElementConfigType }) => {
  const [animated, setAnimated] = useState(
    config.bannerSlideAnimation != SlideAnimationType.None
  )
  const [triggerAnimation, setTriggerAnimation] = useState(false)
  const [extensionLink, setExtensionLink] = useState('')

  useEffect(() => {
    setAnimated(config.bannerSlideAnimation != SlideAnimationType.None)
  }, [config])

  useEffect(() => {
    const link = getWebMonetizationLink()
    setExtensionLink(link)
  }, [])

  return (
    <div>
      {animated && (
        <div className='flex justify-end -mt-5 mb-1'>
          <img
            onMouseEnter={() => setTriggerAnimation(true)}
            onMouseLeave={() => setTriggerAnimation(false)}
            className='cursor-progress'
            src={`/images/eye.svg`}
            alt='check'
          />
        </div>
      )}
      <div
        className={cx('wm_banner', animated && triggerAnimation && 'animate')}
      >
        {config.bannerTitleText && <h5>{config.bannerTitleText}</h5>}
        <span>{config.bannerDescriptionText}</span>
        <br />
        <span
          className='_wm_link underline cursor-pointer'
          dangerouslySetInnerHTML={{ __html: extensionLink }}
        ></span>
      </div>
    </div>
  )
}

const WidgetConfig = ({
  config,
  ilpayUrl
}: {
  config: ElementConfigType
  ilpayUrl: string
}) => {
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    ;(async () => {
      const configCss = generateConfigCss(config, true)
      const css = await encodeAndCompressParameters(String(configCss))
      const iframeSrc = `${ilpayUrl}?action=${encodeURI(
        config.widgetButtonText
      )}&receiver=${encodeURI(config.walletAddress || '')}&css=${css}`
      setIframeUrl(iframeSrc)
    })()
  }, [config])

  return (
    <div className='flex flex-col items-end wm_widget'>
      <div
        className={cx(
          'content flex flex-col w-96 h-148 overflow-hidden border border-white-300 rounded transition-all ease-in-out duration-1000 rounded-md p-1 focus:outline-none',
          widgetOpen
            ? 'max-w-96 max-h-148 opacity-1'
            : 'max-w-0 max-h-0 opacity-0'
        )}
      >
        <div className='flex flex-col h-auto w-full'>
          <h5>{config?.widgetTitleText}</h5>
          <p>{config?.widgetDescriptionText}</p>
        </div>
        <div className='flex h-full overflow-hidden'>
          <iframe
            id='ilpay_iframe'
            className='h-full w-full overflow-hidden'
            src={iframeUrl}
          />
        </div>
        <WidgetFooter />
      </div>
      <div
        onClick={() => setWidgetOpen(!widgetOpen)}
        className='trigger cursor-pointer w-14 h-14 flex items-center justify-center mt-4 border-transparent rounded-full'
      >
        <img
          className='w-8'
          src={`/images/wm_logo_animated.svg`}
          alt='widget trigger'
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
  ilpayUrl
}: {
  type: string
  toolConfig: ElementConfigType
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
        />
      )
    default:
      return <NotFoundConfig />
  }
}

type ToolPreviewProps = {
  type?: string
  toolConfig: ElementConfigType
  ilpayUrl: string
}

export const ToolPreview = ({
  type,
  toolConfig,
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
        ilpayUrl={ilpayUrl}
      />
    </div>
  )
}
