import {
  ComponentPropsWithoutRef,
  forwardRef,
  Ref,
  useEffect,
  useState
} from 'react'
import { Info } from './icons.js'

const InfoIcon = forwardRef(
  (props: ComponentPropsWithoutRef<'span'>, ref: Ref<HTMLSpanElement>) => {
    return (
      <span ref={ref} {...props}>
        <Info className="w-5 h-5 ml-1 text-blue-300 hover:text-indigo-700" />
      </span>
    )
  }
)

InfoIcon.displayName = 'InfoIcon'

export const InfoWithTooltip = ({
  tooltip
}: {
  tooltip: string | undefined
}) => {
  const [canRenderTooltip, setCanRenderConfig] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setCanRenderConfig(true)
  }, [])

  return (
    <>
      {canRenderTooltip && tooltip && (
        <div
          className="relative inline-flex"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <InfoIcon />

          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-sm bg-white text-gray-800 rounded shadow-md z-10 max-w-xs whitespace-normal">
              <div className="absolute w-2 h-2 bg-white transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
              <span dangerouslySetInnerHTML={{ __html: tooltip }}></span>
            </div>
          )}
        </div>
      )}
    </>
  )
}

InfoWithTooltip.displayName = 'InfoWithTooltip'
