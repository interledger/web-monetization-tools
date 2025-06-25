import React, { useState, useRef, useEffect } from 'react'
import { cx } from 'class-variance-authority'
import { SVGDownArrow } from '../../../assets/svg'

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
      className="group h-11 px-md gap-2.5 rounded-lg inline-flex flex-col justify-center items-start hover:bg-secondary-hover-surface"
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className={cx(
          isOpen
            ? 'text-purple-600'
            : 'px-md font-sans font-normal text-sm leading-5 text-purple-300 group-hover:text-secondary-edge-hover'
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
    </li>
  )
}
