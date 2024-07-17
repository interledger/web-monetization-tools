import { cx } from "class-variance-authority"
import { useEffect, useState } from "react"
import { bgColors } from "~/lib/presets"
import { ElementConfigType, SlideAnimationType } from "~/lib/types"
import { generateCss } from "~/lib/utils"
import { WebExtensionClient } from "~/lib/webExtesnsionClient"

const ButtonConfig = ({ config }: { config: ElementConfigType }) => {
  return (
    <button
      className="wm_button"
      onClick={(e) => WebExtensionClient.triggerWebExtensionWindow(e)}
    >
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

const WidgetConfig = ({ config }: { config: ElementConfigType }) => {
  const [widgetOpen, setWidgetOpen] = useState(false)
  return (
    <div className="flex flex-col items-end wm_widget">
      <div
        className={cx(
          "content flex flex-col justify-between w-56 h-96 overflow-hidden border border-white-300 rounded transition-all ease-in-out duration-1000 rounded-md p-1 focus:outline-none",
          widgetOpen
            ? "max-w-56 max-h-96 opacity-1"
            : "max-w-0 max-h-0 opacity-0"
        )}
      >
        <h5>{config?.widgetTitleText}</h5>
        <p>{config?.widgetDescriptionText}</p>
        <button onClick={(e) => WebExtensionClient.triggerWebExtensionWindow(e)}>
          {config?.widgetButtonText}
        </button>
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

const renderElementConfig = (type: string, toolConfig: ElementConfigType) => {
  switch (type) {
    case "button":
      return <ButtonConfig config={toolConfig} />
    case "banner":
      return <BannerConfig config={toolConfig} />
    case "widget":
      return <WidgetConfig config={toolConfig} />
    default:
      return <NotFoundConfig />
  }
}

type ToolPreviewProps = {
  type?: string
  toolConfig: ElementConfigType
}

export const ToolPreview = ({ type, toolConfig }: ToolPreviewProps) => {
  const bgColor = bgColors[type as keyof typeof bgColors] ?? bgColors.button

  return (
    <div
      className={cx(
        "flex justify-center px-4 py-8 pt-12 rounded-t-lg bg-gradient-to-r",
        bgColor
      )}
    >
      {generateCss(toolConfig)}
      {renderElementConfig(type ?? "", toolConfig)}
    </div>
  )
}
