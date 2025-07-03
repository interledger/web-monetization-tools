import { useState } from 'react'
import { NavLink as RemixNavLink } from '@remix-run/react'
import { NavDropdown } from './index.js'
import { SVGHamburgerIcon, SVGCloseIcon } from '~/assets/svg'
import { cx } from 'class-variance-authority'
import wmLogo from '~/assets/images/wm_logo.svg?url'

// Navigation Link Props
type NavLinkProps = {
  to: string
  children: React.ReactNode
  onClick?: () => void
}

const NavLink = ({ to, children, onClick }: NavLinkProps) => {
  return (
    <li className={'group flex md:justify-center md:items-center'}>
      <a
        href={to}
        className={
          'w-full px-md py-sm font-sans font-normal text-sm leading-sm rounded-lg hover:bg-secondary-hover-surface text-buttons-default group-hover:text-buttons-hover focus:outline-none focus-visible:outline-offset-1 focus-visible:outline-buttons-hover focus-visible:bg-secondary-hover-surface focus-visible:text-buttons-hover'
        }
        onClick={onClick}
      >
        {children}
      </a>
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
      className={cx(
        'relative flex items-center justify-between bg-white shadow-[0px_12px_20px_0px_rgba(0,0,0,0.06)] rounded-lg mx-4 mt-4 h-14 py-1 px-4 pr-2',
        'md:max-w-7xl md:mx-auto md:px-xl md:py-xs md:mt-0 md:rounded-none md:shadow-none md:bg-transparent md:h-auto md:w-full'
      )}
    >
      {/* Web Monetization Logo */}
      <RemixNavLink to="/" className="focus-visible:outline-buttons-hover">
        <img
          src={wmLogo}
          alt="Web Monetization Logo"
          className="w-8 h-8 md:w-11 md:h-11 z-50 focus:outline-none"
        />
      </RemixNavLink>
      {/* Hamburger Menu Button */}
      <button
        className={cx(
          'md:hidden flex items-center justify-center px-xs py-sm group text-buttons-default hover:text-buttons-hover hover:bg-secondary-hover-surface z-50 w-12 h-12 rounded-lg gap-xs overflow-hidden',
          isMobileMenuOpen && 'm-sm fixed top-0 right-0'
        )}
        onClick={toggleMobileMenu}
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <SVGCloseIcon /> : <SVGHamburgerIcon />}
      </button>
      <ul className="hidden md:flex gap-md list-none">
        <NavDropdown title="Tools"></NavDropdown>
        <NavLink to="/docs">Documentation</NavLink>
        <NavLink to="/specification">Specification</NavLink>
      </ul>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center z-40">
          <ul className="flex flex-col gap-md list-none fixed">
            <NavDropdown title="Tools" onMenuItemClick={closeMobileMenu} />
            <NavLink to="/docs" onClick={closeMobileMenu}>
              Documentation
            </NavLink>
            <NavLink to="/specification" onClick={closeMobileMenu}>
              Specification
            </NavLink>
          </ul>
        </div>
      )}
    </nav>
  )
}
