import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef, useId, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { cx } from 'class-variance-authority'
import ClickAwayListener from 'react-click-away-listener'
import {
  backgroundColorPresets,
  textColorPresets,
  triggerColorPresets
} from '~/lib/presets.js'
import { isColorLight } from '~/lib/utils.js'
import checkSvg from '~/assets/images/check.svg'
import colorPickerSvg from '~/assets/images/color_picker.svg'

type ColorPickerProps = ComponentPropsWithoutRef<'div'> & {
  label?: string
  value: string
  name: string
  preset: 'text' | 'background' | 'trigger'
  updateColor: (value: string) => void
  error?: string | string[]
  allowCustomColors?: boolean
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      id,
      value,
      name,
      preset,
      allowCustomColors = true,
      className,
      updateColor,
      ...props
    },
    ref
  ) => {
    const [displayColorpicker, setDisplayColorpicker] = useState(false)

    const generatedId = useId()
    const internalId = id ?? generatedId

    if (!value) {
      return
    }

    const colorPresets =
      preset == 'text'
        ? textColorPresets
        : preset == 'trigger'
          ? triggerColorPresets
          : backgroundColorPresets
    const isCustomColor = colorPresets.indexOf(value.toLowerCase()) == -1

    return (
      <div className={cx('flex relative', className)} ref={ref} {...props}>
        <input type="hidden" name={name} value={value ?? ''} id={internalId} />
        <div className="flex p-3">
          {colorPresets.map((color) => (
            <div
              className={`flex p-2 h-10 w-10 my-2 mx-1 border border-offwhite rounded-full cursor-pointer`}
              style={{ backgroundColor: String(color) }}
              onClick={() => updateColor(color)}
              role="presentation"
              key={color}
            >
              {value.toLowerCase() == color && (
                <img
                  className={cx(
                    'flex max-h-24 mx-auto',
                    isColorLight(color) && 'invert'
                  )}
                  src={checkSvg}
                  alt="check"
                />
              )}
            </div>
          ))}
          <div>
            {allowCustomColors && (
              <div
                className={`flex p-2 h-10 w-10 my-2 mx-1 bg-white border border-offwhite rounded-full cursor-pointer`}
                style={{
                  backgroundColor: isCustomColor ? String(value) : 'white'
                }}
                onClick={() => setDisplayColorpicker(!displayColorpicker)}
                role="presentation"
              >
                <img
                  className="flex max-h-24 mx-auto"
                  src={colorPickerSvg}
                  alt="picker"
                />
              </div>
            )}
            <ClickAwayListener onClickAway={() => setDisplayColorpicker(false)}>
              <div
                className={cx(
                  'absolute border border-gray-400 p-1 -mt-8 ml-8 bg-gray-200 rounded-lg z-10',
                  displayColorpicker ? 'flex flex-col' : 'hidden'
                )}
              >
                <style>{`.react-colorful__last-control { border-radius: 0; }`}</style>
                <HexColorPicker
                  color={String(value)}
                  onChange={(color) => updateColor(color)}
                />
                <div className="flex items-center justify-center p-2 bg-white border-t border-gray-300">
                  <span className="text-gray-600 mr-2">#</span>
                  <HexColorInput
                    color={String(value)}
                    onChange={(color) => updateColor(color)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="000000"
                  />
                </div>
              </div>
            </ClickAwayListener>
          </div>
        </div>
      </div>
    )
  }
)

ColorPicker.displayName = 'ColorPicker'
