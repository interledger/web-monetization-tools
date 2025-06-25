import wmLogo from '~/assets/images/wm_logo.svg?url'
import { NavLink as RemixNavLink } from '@remix-run/react'
import { NavLink, NavDropdown } from './index.js'

export const NavBar = () => {
  return (
    <nav
      role="navigation"
      className="flex flex-col justify-center items-center gap-2.5 py-xs px-md flex-1 bg-white shadow-[0px_12px_20px_0px_rgba(0,0,0,0.06)]"
    >
      <div className="inline-flex flex-col justify-center items-center gap-2.5">
        {/* Web Monetization Logo */}
        <RemixNavLink to="/">
          <img src={wmLogo} alt="Web Monetization Logo" />
        </RemixNavLink>
      </div>
      <div className="flex justify-start items-center gap-4">
        <ul>
          <NavDropdown title="Tools"></NavDropdown>
          <NavLink to="/docs">Documentation</NavLink>
          <NavLink to="/specification">Specification</NavLink>
        </ul>
      </div>
    </nav>
  )
}
