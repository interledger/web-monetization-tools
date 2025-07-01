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
        className="w-full p-3 rounded-lg flex justify-start items-center gap-xs hover:bg-gray-100 min-w-0"
      >
        <img
          className="w-[120px] h-[120px]"
          src={imgSrc}
          aria-hidden="true"
          alt=""
        />
        <div className="text-text-primary text-base font-bold font-sans leading-normal flex-grow min-w-0 truncate">
          {text}
        </div>
      </RemixNavLink>
    </li>
  )
}
