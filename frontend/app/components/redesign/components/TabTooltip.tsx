import { useState, useRef, useEffect } from 'react'

export interface TabTooltipProps {
  children: React.ReactNode
  text: string
  className?: string
}

export function TabTooltip({
  children,
  text,
  className = ''
}: TabTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShowTooltip, setShouldShowTooltip] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const isTextTruncated =
          textRef.current.scrollWidth > textRef.current.clientWidth
        setShouldShowTooltip(isTextTruncated)
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [text])

  const handleMouseEnter = () => {
    if (shouldShowTooltip) {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }
  return (
    <div className="relative w-full">
      <p
        ref={textRef}
        className={`w-[150px] text-base leading-md font-normal overflow-hidden whitespace-nowrap text-ellipsis ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </p>
      {isVisible && shouldShowTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-interface-tooltip rounded-lg shadow-lg whitespace-nowrap">
          <p className="text-white text-sm">{text}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-interface-tooltip"></div>
        </div>
      )}
    </div>
  )
}

export default TabTooltip
