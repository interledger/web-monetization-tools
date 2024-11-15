import type { LinkProps } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { Button } from './Button.js'
import { InfoIconWithTooltip } from './InfoIconWithTooltip.js'

export type TypeCardProps = {
  image: string
  title: string
  tooltip: string
  description: string
  link: LinkProps['to'] | never
  bgColor: string
}

export const TypeCard = ({
  image,
  title,
  tooltip,
  description,
  link,
  bgColor
}: TypeCardProps) => {
  return (
    <div className="flex flex-col shrink-0 bg-white rounded-lg w-80 p-6">
      <div className={cx('flex py-6 rounded-lg bg-gradient-to-r', bgColor)}>
        <img
          className="max-h-24 mx-auto"
          src={`images/${image ?? 'placeholder.svg'}`}
          alt={title}
        />
      </div>
      <span className="text-center flex justify-center font-bold text-2xl mt-4">
        <span>{title}</span>
        <InfoIconWithTooltip tooltip={tooltip} />
      </span>
      <p className="text-center text-sm min-h-36 p-4 mb-4">{description}</p>
      <Button intent="default" aria-label={title} to={link}>
        Generate
      </Button>
    </div>
  )
}
