import React from 'react'
import { GhostButton } from './GhostButton'
import { SVGArrowLeft } from '../../../assets/svg'
import { Heading1 } from '../Typography'

interface HeadingCoreProps {
  title: string
  onBackClick?: () => void
  className?: string
}

export const HeadingCore: React.FC<HeadingCoreProps> = ({
  title,
  onBackClick,
  className = ''
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex flex-row relative items-center justify-between py-0 w-full">
        <div id="back-button" className="relative rounded-sm">
          <GhostButton onClick={onBackClick}>
            <SVGArrowLeft />
            All tools
          </GhostButton>
        </div>
        <div className="flex flex-col gap-sm items-center justify-start shrink-0">
          <Heading1>{title}</Heading1>
        </div>

        <div className="opacity-0 relative rounded-sm shrink-0">
          <div className="flex flex-row items-center gap-xs px-xs py-sm">
            <div className="w-5 h-5" />
            <span className="font-normal text-base leading-md text-nowrap">
              All tools
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadingCore
