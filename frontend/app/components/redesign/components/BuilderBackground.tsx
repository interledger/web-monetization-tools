import React from 'react'
import { SVGClose } from '~/assets/svg'
import wmLogo from '~/assets/images/wm_logo.svg?url'

import { ToolsSecondaryButton } from './ToolsSecondaryButton'

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
          {/* Placeholder for Button Tool Component - Skipped as requested */}
          <div
            className="
              w-full max-w-md
              bg-interface-bg-container
              rounded-sm
              border border-field-border
              p-sm
              flex items-center gap-lg
              relative
              shadow-sm
            "
          >
            <img
              src={wmLogo}
              alt="Web Monetization Logo"
              className="w-[24px] h-[24px]"
            />

            {/* Content */}
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="text-base leading-md font-bold text-text-primary">
                How to support?
              </h3>
              <p className="text-xs leading-xs text-text-primary">
                You can support this page and my work by a one time donation or
                proportional to the time you spend on this website through web
                monetization.
              </p>
              <p className="text-xs leading-xs text-secondary-edge underline cursor-pointer">
                Download web monetization extension
              </p>
            </div>

            {/* Close Button */}
            <button className="absolute top-sm right-sm text-text-secondary hover:text-text-primary transition-colors w-6 h-6 flex items-center justify-center">
              <SVGClose />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderBackground
