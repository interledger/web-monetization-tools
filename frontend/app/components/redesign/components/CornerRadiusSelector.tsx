import React from 'react'
import { OptionSelector, type Option } from './OptionSelector'

export type CornerRadiusValue = 'none' | 'light' | 'pill'

export interface CornerRadiusSelectorProps {
  defaultValue?: CornerRadiusValue
  onChange?: (value: CornerRadiusValue) => void
}

const cornerRadiusOptions: Option<CornerRadiusValue>[] = [
  { id: 'no-rounding', label: 'No rounding', value: 'none' },
  { id: 'light-rounding', label: 'Light rounding', value: 'light' },
  { id: 'pill-rounding', label: 'Pill rounding', value: 'pill' }
]

export function CornerRadiusSelector({
  defaultValue = 'light',
  onChange
}: CornerRadiusSelectorProps) {
  return (
    <OptionSelector
      options={cornerRadiusOptions}
      defaultValue={defaultValue}
      onChange={onChange}
      className="justify-between"
    />
  )
}
