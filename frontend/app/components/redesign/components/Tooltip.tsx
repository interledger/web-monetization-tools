import { useState } from 'react'
import { SVGTooltip } from '../../../assets/svg'

export interface TooltipProps {
  text: string
  className?: string
}

export function Tooltip({ text, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`w-fit relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SVGTooltip />
      {open && (
        <div className="absolute z-50 left-8 top-1/2 -translate-y-1/2 w-[485px] flex items-center justify-center gap-2.5 p-4 bg-interface-tooltip rounded-lg shadow-lg">
          <p className="flex-1 mt-[-1.00px]  text-white">{text}</p>
        </div>
      )}
    </div>
  )
}
