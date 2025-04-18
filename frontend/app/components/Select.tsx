import type { ReactNode } from 'react'
import { Fragment, useEffect, useId, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { cx } from 'class-variance-authority'
import { Check, Chevron } from './icons.js'
import { Label, FieldError } from './index.js'

export type SelectOption = {
  label: string
  value: string
}

type SelectProps = {
  options: SelectOption[]
  placeholder: string
  name?: string
  label?: string
  tooltip?: string
  disabled?: boolean
  required?: boolean
  error?: string | string[]
  value?: SelectOption
  defaultValue?: SelectOption
  description?: ReactNode
  withBorder?: boolean
  searchable?: boolean
  onChange?: (value: string) => void
}

export const Select = ({
  options,
  name,
  placeholder,
  label,
  tooltip,
  error,
  disabled = false,
  required = false,
  defaultValue = {
    label: '',
    value: ''
  },
  value,
  withBorder,
  searchable = false,
  onChange
}: SelectProps) => {
  const id = useId()
  const [internalValue, setInternalValue] = useState<SelectOption>(defaultValue)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions =
    searchTerm === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(searchTerm.toLowerCase().replace(/\s+/g, ''))
        )

  useEffect(() => {
    if (value) {
      setInternalValue(value)
    }
  }, [value])

  return (
    <Combobox
      value={internalValue}
      onChange={(e) => {
        setInternalValue(e)
        if (onChange !== undefined) {
          onChange(e.value)
        }
      }}
      disabled={disabled}
    >
      {name ? (
        <input type="hidden" name={name} value={internalValue.value ?? ''} />
      ) : null}
      <div className={cx('flex flex-col relative w-full', label && 'mt-1')}>
        {label && (
          <Label
            className={cx('w-full mb-px', tooltip && 'flex')}
            tooltip={tooltip}
          >
            {label}
          </Label>
        )}
        <div
          className={cx(
            'relative w-full cursor-default overflow-hidden bg-white text-left outline-0 focus:outline-none sm:text-sm h-9',
            withBorder && 'border rounded-lg'
          )}
        >
          {searchable ? (
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-900 outline-none"
              id={id}
              required={required}
              displayValue={(option: SelectOption) => option.label}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={placeholder}
            />
          ) : (
            <Combobox.Button className="w-full max-h-8 h-8 border-none py-2 pl-3 pr-10 text-sm text-left text-gray-900 outline-none whitespace-nowrap overflow-hidden text-ellipsis">
              <>{internalValue ? internalValue.label : placeholder}</>
            </Combobox.Button>
          )}
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {({ open }) => (
              <Chevron
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
                strokeWidth={3}
                direction={open ? 'down' : 'left'}
              />
            )}
          </Combobox.Button>
        </div>
        {error ? <FieldError error={error} /> : null}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setSearchTerm('')}
        >
          <Combobox.Options
            className={cx(
              'absolute max-h-60 w-auto overflow-auto rounded-b-md bg-white py-1 z-10 text-base shadow-lg outline-0 focus:outline-none sm:text-sm',
              label ? 'mt-14' : 'mt-8'
            )}
          >
            {filteredOptions.length === 0 && searchTerm !== '' ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-teal-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-teal-600'
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
