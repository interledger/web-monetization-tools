import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { forwardRef, useEffect, useId, useState } from 'react'
import { cx } from 'class-variance-authority'
import { FieldError, Label } from './index.js'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string
  error?: string | string[]
  tooltip?: string
  description?: ReactNode
  withBorder?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      description,
      label,
      type,
      tooltip,
      error,
      id,
      withBorder,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const internalId = id ?? generatedId

    const [localError, setLocalError] = useState(error)

    useEffect(() => {
      setLocalError(error)
    }, [error])

    return (
      <div className={cx('flex flex-col', label && 'mt-1', className)}>
        {label && (
          <Label
            className={cx('w-full mb-px', tooltip && 'flex')}
            htmlFor={internalId}
            required={props.required ?? false}
            tooltip={tooltip}
          >
            {label}
          </Label>
        )}
        <div
          className={cx(
            'flex relative w-full bg-white p-2 h-9',
            withBorder && 'border rounded-lg'
          )}
        >
          <input
            id={internalId}
            ref={ref}
            type={type ?? 'text'}
            className={cx(
              'block w-full h-full text-sm transition-colors duration-150 placeholder:font-extralight focus:border-tealish focus:outline-none focus:ring-0 disabled:bg-mercury'
            )}
            {...props}
            onKeyDown={() => setLocalError('')}
          />
        </div>
        {description ? (
          <div className="font-medium text-sm">{description}</div>
        ) : null}
        <FieldError error={localError} />
      </div>
    )
  }
)

Input.displayName = 'Input'
