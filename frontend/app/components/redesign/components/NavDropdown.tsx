import { useState, useRef, useEffect } from 'react'
import { NavLink as RemixNavLink } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { SVGDownArrow } from '~/assets/svg'
import devHeroSVG from '~/assets/images/dev-hero.svg?url'
import pubHeroSVG from '~/assets/images/publishers-hero.svg?url'
import supHeroSVG from '~/assets/images/supporters-hero.svg?url'

// Navigation Dropdown Props
type NavDropdownProps = {
  title: string
  isMobile?: boolean
  onMenuItemClick?: () => void
}

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
        className="w-full p-sm rounded-lg flex justify-start items-center gap-xs hover:bg-secondary-hover-surface"
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

export const NavDropdown = ({
  title,
  isMobile = false,
  onMenuItemClick
}: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHoveringMenuItems, setIsHoveringMenuItems] = useState(false)

  const dropdownRef = useRef<HTMLLIElement>(null)

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
  }, [isMobile])

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
        'group gap-2.5 rounded-lg inline-flex flex-col justify-center items-start relative',
        !isHoveringMenuItems && 'hover:bg-secondary-hover-surface'
      )}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className={cx(
          'flex items-center gap-xs px-md py-sm font-sans font-normal text-sm leading-sm w-full justify-between',
          'md:w-auto md:justify-normal',
          isOpen ? 'text-buttons-hover' : 'text-buttons-default',
          !isHoveringMenuItems && 'group-hover:text-buttons-hover'
        )}
        aria-label="Toggle Dropdown"
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
          className={cx(
            'flex flex-col ',
            isMobile
              ? 'relative overflow-hidden max-w-[175px] h-[208px] z-50'
              : 'w-[299px] h-[472px] absolute top-[calc(100%+16px)] left-0 shadow-[0px_24px_24px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-interface-edge-container z-50 justify-start items-start gap-xs p-sm bg-interface-bg-container rounded-lg'
          )}
          onMouseEnter={handleDropdownContentMouseEnter}
          onMouseLeave={handleDropdownContentMouseLeave}
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
