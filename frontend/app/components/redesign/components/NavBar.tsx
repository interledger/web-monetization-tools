import { useState } from 'react'
import { NavLink as RemixNavLink } from '@remix-run/react'
import { NavDropdown } from './index.js'
import { SVGHamburgerIcon, SVGCloseIcon } from '~/assets/svg'
import wmLogo from '~/assets/images/wm_logo.svg?url'

// Navigation Link Props
type NavLinkProps = {
  to: string
  children: React.ReactNode
  onClick?: () => void
}

const NavLink = ({ to, children, onClick }: NavLinkProps) => {
  return (
    <li
      className={
        'group rounded-lg inline-flex md:justify-center md:items-center gap-2.5 hover:bg-secondary-hover-surface'
      }
    >
      <RemixNavLink
        to={to}
        className={
          'px-md py-sm font-sans font-normal text-sm leading-sm text-buttons-default group-hover:text-buttons-hover'
        }
        onClick={onClick}
      >
        {children}
      </RemixNavLink>
    </li>
  )
}

export const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      role="navigation"
      className="w-full bg-white shadow-[0px_12px_20px_0px_rgba(0,0,0,0.06)] gap-2.5"
    >
      <div className="max-w-7xl mx-auto px-md py-xs flex justify-between items-center">
        {/* Web Monetization Logo */}
        <RemixNavLink to="/">
          <img
            src={wmLogo}
            alt="Web Monetization Logo"
            className="w-8 h-8 md:w-11 md:h-11 z-50"
          />
        </RemixNavLink>
        {/* Hamburger Menu Button */}
        <button
          className="md:hidden flex items-center justify-center p-2 fill-buttons-default hover:text-buttons-hover focus:outline-none focus:ring-2 focus:ring-buttons-hover z-50"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <SVGCloseIcon className="fill-buttons-default" />
          ) : (
            <SVGHamburgerIcon className="fill-buttons-default" />
          )}
        </button>
        <ul className="hidden md:flex gap-md">
          <NavDropdown title="Tools"></NavDropdown>
          <NavLink to="/docs">Documentation</NavLink>
          <NavLink to="/specification">Specification</NavLink>
        </ul>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center z-40 overflow-y-auto">
            <ul className="flex flex-col gap-md py-md">
              <NavDropdown
                title="Tools"
                isMobile={true}
                onMenuItemClick={closeMobileMenu}
              />
              <NavLink to="/docs" onClick={closeMobileMenu}>
                Documentation
              </NavLink>
              <NavLink to="/specification" onClick={closeMobileMenu}>
                Specification
              </NavLink>
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
