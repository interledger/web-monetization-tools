import { useRef } from 'react'
import { cx } from 'class-variance-authority'
import { UploadImage, XIcon } from './icons.js'
import { Button } from './index.js'
import { processSVG } from '~/lib/utils.js'
import { triggerColorPresets } from '~/lib/presets.js'

export type UploadControlProps = {
  name: string
  value: string
  setImage: (value: string, color?: string) => void
}

const resizeImage = (img: HTMLImageElement, maxSize: number = 100): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  // Calculate the new width and height while maintaining aspect ratio
  let width = img.width
  let height = img.height

  if (width > height) {
    height = (maxSize / width) * height
    width = maxSize
  } else {
    width = (maxSize / height) * width
    height = maxSize
  }

  // Set canvas dimensions and draw image
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  // Convert canvas to base64
  return canvas.toDataURL('image/png')
}

export const UploadControl = ({
  setImage,
  name,
  value
}: UploadControlProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const defaultColor = triggerColorPresets[0]

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      const fileType = file.type

      if (fileType === 'image/svg+xml') {
        const svgBase64 = await processSVG(file)
        setImage(svgBase64) // Set the Base64 string of the resized SVG
      } else {
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            const img = new Image()
            img.src = e.target.result as string

            img.onload = () => {
              const resizedBase64 = resizeImage(img)
              setImage(resizedBase64) // Set the base64 string as the resized image
            }
          }
        }

        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <div className="flex flex-row mr-3 text-white">
      <input
        className="hidden"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <input type="hidden" name={name} value={value ?? ''} />
      <Button
        className="max-h-8"
        aria-label="Upload image"
        title="Upload image"
        intent="invisible"
        onClick={onButtonClick}
      >
        <UploadImage
          className={cx('m-0.5 h-5 w-5 hover:m-0 hover:w-6 hover:h-6')}
        />
      </Button>
      <Button
        className="max-h-8"
        aria-label="Remove image"
        title="Remove image"
        intent="invisible"
        onClick={() => {
          setImage('', defaultColor)
        }}
      >
        <XIcon className={cx('m-0.5 h-5 w-5 hover:m-0 hover:w-6 hover:h-6')} />
      </Button>
    </div>
  )
}
