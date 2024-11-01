import { LinkProps } from '@remix-run/react'
import { Button } from './Button'
import { cx } from 'class-variance-authority'

export type TypeCardProps = {
  image: string
  title: string
  description: string
  link: LinkProps['to'] | never
  bgColor: string
}

export const TypeCard = ({
  image,
  title,
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
      <span className="text-center font-bold text-2xl mt-4">{title}</span>
      <p className="text-center text-sm p-4 mb-4">{description}</p>
      <Button intent="default" aria-label={title} to={link}>
        Generate
      </Button>
    </div>
  )
}
