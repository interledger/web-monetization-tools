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
        'group rounded-lg inline-flex justify-center items-center gap-2.5 hover:bg-secondary-hover-surface'
      }
    >
      <RemixNavLink
        to={to}
        className={
          'px-md py-sm font-sans font-normal text-sm leading-sm text-buttons-default group-hover:text-buttons-hover'
        }
      >
        {children}
      </RemixNavLink>
    </li>
  )
}
