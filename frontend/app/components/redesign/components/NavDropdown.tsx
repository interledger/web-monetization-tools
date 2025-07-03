import { useState, useRef, useEffect } from 'react'
import { NavLink as RemixNavLink } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { SVGDownArrow } from '~/assets/svg'
import devHeroSVG from '~/assets/images/dev-hero.svg?url'
import pubHeroSVG from '~/assets/images/publishers-hero.svg?url'
import supHeroSVG from '~/assets/images/supporters-hero.svg?url'

// Tools Menu Item Props
type ToolsMenuItemProps = {
  to: string
  imgSrc: string
  text: string
  onClick?: () => void
}

const ToolsMenuItem = ({ to, imgSrc, text, onClick }: ToolsMenuItemProps) => {
  return (
    <li>
      <RemixNavLink
        to={to}
        className="w-full p-sm rounded-lg flex justify-start items-center gap-xs hover:bg-secondary-hover-surface focus:outline-none focus-visible:outline-offset-1 focus-visible:outline-buttons-hover focus-visible:bg-secondary-hover-surface focus-visible:text-buttons-hover"
        onClick={onClick}
      >
        <img
          className="w-10 h-10 md:w-[120px] md:h-[120px]"
          src={imgSrc}
          aria-hidden="true"
          alt=""
        />
        <div className="flex-grow text-text-primary text-sm font-normal font-sans leading-normal whitespace-nowrap md:text-base md:font-bold">
          {text}
        </div>
      </RemixNavLink>
    </li>
  )
}

// Navigation Dropdown Props
type NavDropdownProps = {
  title: string
  onMenuItemClick?: () => void
}

export const NavDropdown = ({ title, onMenuItemClick }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHoveringMenuItems, setIsHoveringMenuItems] = useState(false)

  const dropdownRef = useRef<HTMLLIElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        if (triggerRef.current) {
          triggerRef.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleDropdownContentMouseEnter = () => {
    setIsHoveringMenuItems(true)
  }

  const handleDropdownContentMouseLeave = () => {
    setIsHoveringMenuItems(false)
  }

  const handleToolsMenuItemClick = () => {
    setIsOpen(false)
    if (onMenuItemClick) {
      onMenuItemClick()
    }
  }

  return (
    <li
      ref={dropdownRef}
      className={cx(
        'group gap-md inline-flex flex-col justify-center items-start relative'
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className={cx(
          'flex items-center gap-xs px-md py-sm font-sans font-normal text-sm leading-sm w-full justify-between rounded-lg focus:outline-none focus-visible:outline-offset-1 focus-visible:outline-buttons-hover focus-visible:bg-secondary-hover-surface focus-visible:text-buttons-hover',
          'md:w-auto md:justify-normal',
          isOpen ? 'text-buttons-hover' : 'text-buttons-default',
          !isHoveringMenuItems &&
            'group-hover:text-buttons-hover group-hover:bg-secondary-hover-surface'
        )}
        aria-label="Toggle Dropdown"
        aria-expanded={isOpen}
        aria-controls="nav-dropdown-content"
      >
        {title}
        <span
          className={cx(
            'flex items-center justify-center transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        >
          <SVGDownArrow
            className={cx(
              isOpen ? 'fill-buttons-hover' : 'fill-buttons-default',
              !isHoveringMenuItems && 'group-hover:fill-buttons-hover'
            )}
          />
        </span>
      </button>
      {/* Dropdown Content */}
      {isOpen && (
        <div
          id="nav-dropdown-content"
          className={cx(
            'flex flex-col gap-xs p-sm rounded-lg relative overflow-hidden z-50',
            'md:w-[299px] md:h-[472px] md:absolute md:top-[calc(100%+16px)] md:left-0 md:shadow-[0px_24px_24px_0px_rgba(0,0,0,0.08)] md:outline md:outline-1 md:outline-offset-[-1px] md:outline-interface-edge-container md:justify-start md:items-start md:bg-interface-bg-container'
          )}
          onMouseEnter={handleDropdownContentMouseEnter}
          onMouseLeave={handleDropdownContentMouseLeave}
          role="menu"
          aria-hidden={!isOpen}
        >
          <ul className="w-full flex-grow list-none flex flex-col gap-xs">
            <ToolsMenuItem
              to="/publishers"
              imgSrc={pubHeroSVG}
              text="Publisher tools"
              onClick={handleToolsMenuItemClick}
            />
            <ToolsMenuItem
              to="/supporters"
              imgSrc={supHeroSVG}
              text="Supporter tools"
              onClick={handleToolsMenuItemClick}
            />
            <ToolsMenuItem
              to="/developers"
              imgSrc={devHeroSVG}
              text="Developer tools"
              onClick={handleToolsMenuItemClick}
            />
          </ul>
        </div>
      )}
    </li>
  )
}
