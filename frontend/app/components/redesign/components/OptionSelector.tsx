import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from 'class-variance-authority'

export interface Option<T = string> {
  id: string
  label: string
  value: T
  icon?: ReactNode
}

export interface OptionSelectorProps<T = string> {
  className?: string
  options: Option<T>[]
  defaultValue?: T
  onChange?: (value: T) => void
  renderCustomOption?: (option: Option<T>, isSelected: boolean) => ReactNode
}

export function OptionSelector<T extends string | number>({
  className,
  options,
  defaultValue,
  onChange,
  renderCustomOption
}: OptionSelectorProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T>(
    defaultValue ||
      (options.length > 0 ? options[0].value : ('' as unknown as T))
  )

  const handleChange = (value: T) => {
    setSelectedValue(value)
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={cx('flex flex-row', className)}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value

          if (renderCustomOption) {
            return (
              <div
                key={option.id}
                onClick={() => handleChange(option.value)}
                className="cursor-pointer"
              >
                {renderCustomOption(option, isSelected)}
              </div>
            )
          }

          return (
            <div
              key={option.id}
              className="flex flex-row items-center gap-2 h-11 cursor-pointer"
              onClick={() => handleChange(option.value)}
            >
              <button
                type="button"
                className={cx(
                  'w-4 h-4 rounded-full flex items-center justify-center border',
                  isSelected ? 'border-[#5b5380]' : 'border-[#8075b3]'
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#5b5380]" />
                )}
              </button>

              <div className="flex items-center gap-2">
                {option.icon && <div>{option.icon}</div>}
                <div className="text-style-body-standard">{option.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
