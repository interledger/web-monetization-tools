import React from 'react'
import { SVGPlay } from '../../../assets/svg'

export interface ToolsSecondaryButtonProps {
  children: React.ReactNode
  icon?: 'play'
  iconAlt?: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export function ToolsSecondaryButton({
  children,
  icon,
  className,
  onClick
}: ToolsSecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`
        border border-secondary-edge hover:border-secondary-edge-hover
        text-secondary-edge hover:text-secondary-edge-hover
        bg-white hover:bg-secondary-hover-surface
        px-md py-sm 
        rounded-xs
        font-medium
        focus:outline-none focus:ring-2 focus:ring-primary-focus
        transition-all duration-200
        flex flex-row items-center justify-center gap-2
        ${className}
        `}
      onClick={onClick}
    >
      {icon === 'play' && <SVGPlay />}
      <span className="font-normal leading-md text-base whitespace-pre">
        {children}
      </span>
    </button>
  )
}
