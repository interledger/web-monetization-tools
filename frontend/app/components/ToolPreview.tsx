import { cx } from "class-variance-authority"
import { useEffect, useRef, useState } from "react"
import { bgColors } from "~/lib/presets"
import { ElementConfigType, SlideAnimationType } from "~/lib/types"
import { generateCss } from "~/lib/utils"
import { WidgetFooter } from "./WidgetFooter"

const ButtonConfig = ({ config }: { config: ElementConfigType }) => {
  return (
    <button className="wm_button" onClick={(e) => console.log(e)}>
      {config.buttonText || "?"}
    </button>
  )
}

const BannerConfig = ({ config }: { config: ElementConfigType }) => {
  const [animated, setAnimated] = useState(
    config.bannerSlideAnimation != SlideAnimationType.None
  )
  const [triggerAnimation, setTriggerAnimation] = useState(false)

  useEffect(() => {
    setAnimated(config.bannerSlideAnimation != SlideAnimationType.None)
  }, [config])

  return (
    <div>
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
        className={cx("wm_banner", animated && triggerAnimation && "animate")}
      >
        {config.bannerTitleText && <h5>{config.bannerTitleText}</h5>}
        <span>{config.bannerDescriptionText}</span>
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
  const [iframeUrl, setIframeUrl] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    const iframeSrc = `${ilpayUrl}?action=${encodeURI(
      config.widgetButtonText
    )}&receiver=${encodeURI(config.walletAddress || "")}`
    setIframeUrl(iframeSrc)

    setTimeout(() => {
      if (ref.current) {
        // send compiled css to iframe
        const configCss = generateCss(config, true)
        const iframe = document.getElementById(
          "ilpay_iframe"
        ) as HTMLIFrameElement
        const iframeContent = iframe.contentWindow

        if (iframe && iframeContent) {
          iframeContent.postMessage({ configCss }, "*")
        }
      }
    }, 1000)
  }, [ref.current, config])

  return (
    <div className="flex flex-col items-end wm_widget">
      <div
        className={cx(
          "content flex flex-col w-96 h-176 overflow-hidden border border-white-300 rounded transition-all ease-in-out duration-1000 rounded-md p-1 focus:outline-none",
          widgetOpen
            ? "max-w-96 max-h-176 opacity-1"
            : "max-w-0 max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col h-auto w-full">
          <h5>{config?.widgetTitleText}</h5>
          <p>{config?.widgetDescriptionText}</p>
        </div>
        <div className="flex h-full overflow-hidden"> 
          <iframe
            id="ilpay_iframe"
            ref={ref}
            className="h-full w-full overflow-hidden"
            src={iframeUrl}
          />
        </div>
        <WidgetFooter />
      </div>
      <div className="trigger flex mt-4">
        <img
          onClick={() => setWidgetOpen(!widgetOpen)}
          className="cursor-pointer"
          src={`/images/widget_logo.svg`}
          alt="widget trigger"
        />
      </div>
    </div>
  )
}

const NotFoundConfig = () => {
  return <div>This is not a valid option</div>
}

const renderElementConfig = (
  type: string,
  toolConfig: ElementConfigType,
  ilpayUrl: string
) => {
  switch (type) {
    case "button":
      return <ButtonConfig config={toolConfig} />
    case "banner":
      return <BannerConfig config={toolConfig} />
    case "widget":
      return <WidgetConfig config={toolConfig} ilpayUrl={ilpayUrl} />
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
        "flex justify-center px-4 py-8 pt-12 rounded-t-lg bg-gradient-to-r",
        bgColor
      )}
    >
      {generateCss(toolConfig)}
      {renderElementConfig(type ?? "", toolConfig, ilpayUrl)}
    </div>
  )
}
