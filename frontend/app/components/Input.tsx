import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { forwardRef, useEffect, useId, useState } from 'react'
import { FieldError } from './FieldError'
import { Label } from './Label'
import { cx } from 'class-variance-authority'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string
  error?: string | string[]
  description?: ReactNode
  withBorder?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { description, label, type, error, id, withBorder, className, ...props },
    ref
  ) => {
    const generatedId = useId()
    const internalId = id ?? generatedId

    const [localError, setLocalError] = useState(error)

    useEffect(() => {
      setLocalError(error)
    }, [error])

    return (
      <div className={cx('flex flex-col', className)}>
        {label && (
          <Label
            className="w-full"
            htmlFor={internalId}
            required={props.required ?? false}
          >
            {label}
          </Label>
        )}
        <div
          className={cx(
            'flex relative w-full p-2',
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
