import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import wmLogo from '~/assets/images/wm_logo.svg?url'
import { toolState } from '~/stores/toolStore'

import { ToolsSecondaryButton } from './ToolsSecondaryButton'

// Import the banner web component
import type { BannerConfig, PaymentBanner } from '@tools/components'

// Declare the custom element for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'wm-payment-banner': React.DetailedHTMLProps<
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
  const createDotPattern = () => {
    const svgString = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="2" fill="white" fill-opacity="0.5" /></svg>`

    return `data:image/svg+xml;base64,${btoa(svgString)}`
  }

  return (
    <div
      className={`
        bg-[#efefef]
        rounded-[20px]
        p-4
        flex flex-col gap-2.5 items-center justify-center
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
      <ToolsSecondaryButton icon="play" className="w-[130px]">
        Preview
      </ToolsSecondaryButton>

      {/* Browser Mockup */}
      <div
        className="
          w-full h-[406px]
          bg-white
          rounded-2xl
          border border-field-border
          overflow-hidden
          flex flex-col
        "
      >
        {/* Browser Header */}
        <div className="flex items-center p-md">
          <div className="flex items-center gap-4 w-full">
            <BrowserDots />
            <div className="flex-1 h-2 bg-field-border rounded-full" />
          </div>
        </div>

        {/* Browser Content */}
        <div className="flex-1 p-md flex items-end justify-center bg-gray-50">
          <div className="w-full max-w-full">
            <Banner />
          </div>
        </div>
      </div>
    </div>
  )
}

const Banner = () => {
  const snap = useSnapshot(toolState)
  const [isLoaded, setIsLoaded] = useState(false)
  const bannerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadBannerComponent = async () => {
      console.log('!!! Loading banner component...')
      await import('@tools/components/banner')
      setIsLoaded(true)
    }

    loadBannerComponent()
  }, [snap.toolConfig])

  const bannerConfig = useMemo(
    () =>
      ({
        bannerTitleText: snap.toolConfig?.bannerTitleText,
        bannerDescriptionText: snap.toolConfig?.bannerDescriptionText,
        logo: wmLogo,
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
      bannerContainerRef.current.innerHTML = ''

      const bannerElement = document.createElement(
        'wm-payment-banner'
      ) as PaymentBanner
      bannerElement.config = bannerConfig

      bannerContainerRef.current.appendChild(bannerElement)
    }
  }, [bannerConfig, isLoaded])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div
      ref={bannerContainerRef}
      className="w-full max-w-full overflow-hidden"
    />
  )
}

export default BuilderBackground
