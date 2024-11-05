import { cva, cx, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { ButtonOrLink, type ButtonOrLinkProps } from './ButtonOrLink.js'

const buttonStyles = cva(
  'inline-flex items-center justify-center w-fit rounded-md px-3 py-1 border border-wm-green m-auto focus:outline-none disabled:cursor-not-allowed disabled:bg-mercury disabled:text-gray-500',
  {
    variants: {
      intent: {
        default:
          'text-sm hover:bg-gradient-to-r hover:from-wm-green hover:to-wm-green-fade',
        reset:
          'text-sm hover:from-wm-purple hover:to-[#7f7fff] hover:text-white hover:bg-gradient-to-r',
        danger:
          'disabled:bg-red-200 bg-red-500 hover:bg-red-600 shadow-md text-white'
      },
      size: {
        sm: 'px-2 py-1 ',
        md: ''
      }
    },
    defaultVariants: {
      intent: 'default',
      size: 'md'
    }
  }
)

type ButtonProps = VariantProps<typeof buttonStyles> &
  ButtonOrLinkProps & {
    ['aria-label']: string
    variant?: string
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ intent, children, className, variant, ...props }, ref) => {
    return (
      <ButtonOrLink
        ref={ref}
        className={cx(buttonStyles({ intent }), className)}
        {...props}
      >
        {children}
      </ButtonOrLink>
    )
  }
)

Button.displayName = 'Button'
