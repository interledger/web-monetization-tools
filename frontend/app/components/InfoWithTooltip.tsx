import type {
  ComponentPropsWithoutRef,
  Ref} from 'react';
import {
  forwardRef,
  useEffect,
  useState
} from 'react'
import Tippy from '@tippyjs/react'
import { Info } from './icons.js'
import 'tippy.js/dist/tippy.css'

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

  useEffect(() => {
    setCanRenderConfig(true)
  }, [])

  return (
    <>
      {canRenderTooltip && tooltip && (
        <Tippy
          content={<span dangerouslySetInnerHTML={{ __html: tooltip }}></span>}
          allowHTML={true}
        >
          <InfoIcon />
        </Tippy>
      )}
    </>
  )
}

InfoWithTooltip.displayName = 'InfoWithTooltip'
