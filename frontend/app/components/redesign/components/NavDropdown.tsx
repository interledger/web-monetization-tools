import React, { useState, useRef, useEffect } from 'react'
import { cx } from 'class-variance-authority'
import { SVGDownArrow } from '~/assets/svg'
import devTools from '~/assets/images/dev-tools.png?url'
import pubTools from '~/assets/images/pub-tools.png?url'
import suppTools from '~/assets/images/supp-tools.png?url'

// Navigation Dropdown Props
type NavDropdownProps = {
  title: string
}

export const NavDropdown = ({ title }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownRef = useRef<HTMLLIElement>(null)

  // Close dropdown when clicking outside
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

  return (
    <li
      ref={dropdownRef}
      className="group h-11 gap-2.5 rounded-lg inline-flex flex-col justify-center items-start hover:bg-secondary-hover-surface relative"
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className={cx(
          'flex items-center gap-xs px-md font-sans font-normal text-sm leading-5',
          isOpen
            ? 'text-purple-600'
            : 'text-purple-300 group-hover:text-secondary-edge-hover'
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
              isOpen
                ? 'fill-purple-600'
                : 'fill-purple-300 group-hover:fill-purple-600'
            )}
          />
        </span>
      </button>
      {/* Dropdown Content - Controlled by 'isOpen' state */}
      {isOpen && (
        <div className="flex flex-col justify-start items-start w-[299px] h-[472px] absolute top-[calc(100%+16px)] left-0 gap-xs p-sm bg-interface-bg-container rounded-lg shadow-[0px_24px_24px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-interface-edge-container">
          <ul className="w-full flex-grow list-none flex flex-col gap-xs">
            <li>
              <a
                href="#"
                className="w-full p-3 rounded-lg flex justify-start items-center gap-xs hover:bg-gray-100 min-w-0"
              >
                <img
                  className="w-[120px] h-[120px]"
                  src={pubTools}
                  alt="Publisher tools icon"
                />
                <div className="text-text-primary text-base font-bold font-sans leading-normal flex-grow min-w-0 truncate">
                  Publisher tools
                </div>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="w-full p-3 rounded-lg flex justify-start items-center gap-xs hover:bg-gray-100 min-w-0"
              >
                <img
                  className="w-[120px] h-[120px]"
                  src={suppTools}
                  alt="Supporter tools icon"
                />
                <div className="text-text-primary text-base font-bold font-sans leading-normal flex-grow min-w-0 truncate">
                  Supporter tools
                </div>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="w-full p-3 rounded-lg flex justify-start items-center gap-xs hover:bg-gray-100 min-w-0"
              >
                <img
                  className="w-[120px] h-[120px]"
                  src={devTools}
                  alt="Developer tools icon"
                />
                <div className="text-text-primary text-base font-bold font-sans leading-normal flex-grow min-w-0 truncate">
                  Developer tools
                </div>
              </a>
            </li>
          </ul>
        </div>
      )}
    </li>
  )
}
