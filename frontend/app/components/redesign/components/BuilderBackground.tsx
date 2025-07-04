import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSnapshot } from 'valtio'
import { toolState } from '~/stores/toolStore'

import { ToolsSecondaryButton } from './ToolsSecondaryButton'

// Import the banner web component
import type { BannerConfig, PaymentBanner } from '@tools/components'

// Declare the custom element for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'wm-banner': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<PaymentBanner> },
        HTMLElement
      >
    }
  }
}

const BrowserDots = () => (
  <svg width="39" height="8" viewBox="0 0 39 8" fill="none">
    <circle cx="4" cy="4" r="3.5" fill="#FF5F57" stroke="#E0443E" />
    <circle cx="20" cy="4" r="3.5" fill="#FFBD2E" stroke="#DEA123" />
    <circle cx="35" cy="4" r="3.5" fill="#28CA42" stroke="#1AAB29" />
  </svg>
)

interface BuilderBackgroundProps {
  className?: string
}

export const BuilderBackground: React.FC<BuilderBackgroundProps> = ({
  className = ''
}) => {
  const snap = useSnapshot(toolState)
  const bannerRef = useRef<BannerHandle>(null)

  const handlePreviewClick = () => {
    if (bannerRef.current) {
      bannerRef.current.triggerPreview()
    }
  }

  const createDotPattern = () => {
    const svgString = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="2" fill="white" fill-opacity="0.5" /></svg>`

    return `data:image/svg+xml;base64,${btoa(svgString)}`
  }

  return (
    <div
      id="builder-background"
      className={`
        bg-[#efefef]
        rounded-[20px]
        p-4
        flex flex-col gap-2.5 items-center justify-end
        min-h-[600px]
        relative
        ${className}
      `}
      style={{
        backgroundImage: `url("${createDotPattern()}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '16px 16px'
      }}
    >
      <ToolsSecondaryButton
        icon="play"
        className="w-[130px] order-first mb-auto"
        onClick={handlePreviewClick}
      >
        Preview
      </ToolsSecondaryButton>

      {/* Browser Mockup */}
      <div
        id="browser-mockup"
        className="w-full h-[406px]
          bg-transparent
          rounded-2xl
          border border-field-border
          overflow-hidden
          flex flex-col
        "
      >
        {/* Browser Header */}
        <div className="flex items-center p-md bg-white">
          <div className="flex items-center gap-4 w-full">
            <BrowserDots />
            <div className="flex-1 h-2 bg-field-border rounded-full" />
          </div>
        </div>

        {/* Browser Content */}
        <div
          id="browser-content"
          className={`flex-1 p-md flex justify-center bg-transparent ${
            snap.toolConfig?.bannerPosition === 'Top'
              ? 'items-start'
              : 'items-end'
          }`}
        >
          <div className="w-full max-w-full">
            <Banner ref={bannerRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

interface BannerHandle {
  triggerPreview: () => void
}

const Banner = React.forwardRef<BannerHandle>((props, ref) => {
  const snap = useSnapshot(toolState)
  const [isLoaded, setIsLoaded] = useState(false)
  const bannerContainerRef = useRef<HTMLDivElement>(null)
  const bannerElementRef = useRef<PaymentBanner | null>(null)

  useImperativeHandle(ref, () => ({
    triggerPreview: () => {
      if (bannerElementRef.current) {
        bannerElementRef.current.previewAnimation()
      }
    }
  }))

  useEffect(() => {
    const loadBannerComponent = async () => {
      if (customElements.get('wm-banner')) {
        setIsLoaded(true)
        return
      }

      // dynamic import - ensure component only runs on the client side and not on SSR
      await import('@tools/components/banner')
      setIsLoaded(true)
    }

    loadBannerComponent()
  }, [])

  const bannerConfig = useMemo(
    () =>
      ({
        bannerTitleText: snap.toolConfig?.bannerTitleText,
        bannerDescriptionText: snap.toolConfig?.bannerDescriptionText,
        bannerPosition: snap.toolConfig?.bannerPosition,
        bannerBorderRadius: snap.toolConfig?.bannerBorder,
        bannerSlideAnimation: snap.toolConfig?.bannerSlideAnimation,
        theme: {
          backgroundColor: snap.toolConfig?.bannerBackgroundColor,
          textColor: snap.toolConfig?.bannerTextColor,
          fontSize: snap.toolConfig?.bannerFontSize,
          fontFamily: snap.toolConfig?.bannerFontName
        }
      }) as BannerConfig,
    [snap.toolConfig]
  )

  useEffect(() => {
    if (bannerContainerRef.current && isLoaded) {
      if (bannerElementRef.current) {
        bannerElementRef.current.config = bannerConfig
        return
      }

      const bannerElement = document.createElement('wm-banner') as PaymentBanner
      bannerElement.config = bannerConfig
      bannerElementRef.current = bannerElement

      bannerContainerRef.current.appendChild(bannerElement)
    }
  }, [bannerConfig, isLoaded])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  const isTopPosition = bannerConfig.bannerPosition === 'Top'

  return (
    <div
      ref={bannerContainerRef}
      className={`w-full max-w-full overflow-hidden ${
        isTopPosition ? 'order-first' : 'order-last'
      }`}
    />
  )
})

Banner.displayName = 'Banner'
export default BuilderBackground
