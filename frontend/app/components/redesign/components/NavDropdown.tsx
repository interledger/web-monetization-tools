import { useState, useRef, useEffect } from 'react'
import { ToolsMenuItem } from './ToolsMenuItem'
import { cx } from 'class-variance-authority'
import { SVGDownArrow } from '~/assets/svg'
import devHeroSVG from '~/assets/images/dev-hero.svg?url'
import pubHeroSVG from '~/assets/images/publishers-hero.svg?url'
import supHeroSVG from '~/assets/images/supporters-hero.svg?url'

// Navigation Dropdown Props
type NavDropdownProps = {
  title: string
}

export const NavDropdown = ({ title }: NavDropdownProps) => {
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
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleDropdownContentMouseEnter = () => {
    setIsHoveringMenuItems(true)
  }

  const handleDropdownContentMouseLeave = () => {
    setIsHoveringMenuItems(false)
  }

  return (
    <li
      ref={dropdownRef}
      className={cx(
        'group gap-2.5 rounded-lg inline-flex flex-col justify-center items-start relative',
        // Apply hover background to the li ONLY if the dropdown is NOT open
        // and the mouse is not hovering over the dropdown content (which implies it's closed)
        !isHoveringMenuItems && 'hover:bg-secondary-hover-surface'
      )}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className={cx(
          'flex items-center gap-xs px-md py-sm font-sans font-normal text-sm leading-sm',
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
          className="flex flex-col justify-start items-start w-[299px] h-[472px] absolute top-[calc(100%+24px)] left-0 gap-xs p-sm bg-interface-bg-container rounded-lg shadow-[0px_24px_24px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-interface-edge-container z-50"
          onMouseEnter={handleDropdownContentMouseEnter}
          onMouseLeave={handleDropdownContentMouseLeave}
        >
          <ul className="w-full flex-grow list-none flex flex-col gap-xs">
            <ToolsMenuItem
              to="/publishers"
              imgSrc={pubHeroSVG}
              text="Publisher tools"
            />
            <ToolsMenuItem
              to="/supporters"
              imgSrc={supHeroSVG}
              text="Supporter tools"
            />
            <ToolsMenuItem
              to="/developers"
              imgSrc={devHeroSVG}
              text="Developer tools"
            />
          </ul>
        </div>
      )}
    </li>
  )
}
