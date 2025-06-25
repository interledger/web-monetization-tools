import { NavLink as RemixNavLink } from '@remix-run/react'

// Navigation Link Props
type NavLinkProps = {
  to: string
  children: React.ReactNode
}

export const NavLink = ({ to, children }: NavLinkProps) => {
  return (
    <li
      className={
        'group px-md py-sm rounded-lg inline-flex justify-center items-center gap-2.5 hover:bg-secondary-hover-surface'
      }
    >
      <RemixNavLink
        to={to}
        className={
          'font-sans font-normal text-sm leading-5 text-purple-300 group-hover:text-secondary-edge-hover'
        }
      >
        {children}
      </RemixNavLink>
    </li>
  )
}
