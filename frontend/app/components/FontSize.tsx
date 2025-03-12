import { cx } from 'class-variance-authority'
import { Button, Label } from './index.js'

type FontSizeProps = {
  label?: string
  name?: string
  value: number
  updateSize: (value: number) => void
}

export const FontSize = ({ label, value, name, updateSize }: FontSizeProps) => {
  const minFontSize = 16
  const maxFontSize = 24

  const increaseFontSize = () => {
    const size = Number(Math.min(value + 1, maxFontSize))
    updateSize(size)
  }

  const decreaseFontSize = () => {
    const size = Number(Math.max(value - 1, minFontSize))
    updateSize(size)
  }

  return (
    <div className={cx('flex flex-col relative w-full', label && 'mt-1')}>
      {name ? <input type="hidden" name={name} value={Number(value)} /> : null}
      {label && <Label className="w-full mb-px">{label}</Label>}
      <div
        className={cx(
          'relative w-full cursor-default overflow-hidden bg-white text-left outline-0 content-center border rounded-lg focus:outline-none sm:text-sm h-9'
        )}
      >
        <Button
          className="!text-black !px-2 hover:font-bold"
          intent="invisible"
          aria-label="Increase font size"
          onClick={increaseFontSize}
        >
          A
        </Button>
        <Button
          className="!text-black !px-2 hover:font-bold"
          intent="invisible"
          aria-label="Decrease font size"
          onClick={decreaseFontSize}
        >
          a
        </Button>
      </div>
    </div>
  )
}
