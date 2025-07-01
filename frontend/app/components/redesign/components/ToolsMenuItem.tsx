import { NavLink as RemixNavLink } from '@remix-run/react'

type ToolsMenuItemProps = {
  to: string
  imgSrc: string
  text: string
}

export const ToolsMenuItem = ({ to, imgSrc, text }: ToolsMenuItemProps) => {
  return (
    <li>
      <RemixNavLink
        to={to}
        className="w-full p-sm rounded-lg flex justify-start items-center gap-xs hover:bg-secondary-hover-surface"
      >
        <img
          className="w-[120px] h-[120px]"
          src={imgSrc}
          aria-hidden="true"
          alt=""
        />
        <div className="flex-grow text-text-primary text-base font-bold font-sans leading-normal">
          {text}
        </div>
      </RemixNavLink>
    </li>
  )
}
