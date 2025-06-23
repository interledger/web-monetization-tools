import React from 'react'
import { cva, cx } from 'class-variance-authority'
import { SVGScriptCode } from '../../../assets/svg'

export interface ToolsPrimaryButtonProps {
  children: React.ReactNode
  iconPosition?: 'left' | 'right' | 'none'
  icon?: 'script' | 'copy'
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const buttonVariants = cva([
  ` flex 
    flex-row 
    items-center 
    gap-2 
    bg-primary-bg hover:bg-primary-bg-hover 
    text-white 
    px-md py-sm 
    rounded-xs
    font-medium
    focus:outline-none focus:ring-2 focus:ring-primary-focus
    transition-colors duration-200`
])

export function ToolsPrimaryButton({
  children,
  iconPosition = 'right',
  icon,
  className,
  onClick
}: ToolsPrimaryButtonProps) {
  return (
    <button className={cx(buttonVariants(), className)} onClick={onClick}>
      {icon === 'script' && iconPosition === 'left' && <SVGScriptCode />}
      <span className="block font-normal leading-[24px] text-[16px] whitespace-pre">
        {children}
      </span>
      {icon === 'script' && iconPosition === 'right' && <SVGScriptCode />}
    </button>
  )
}
