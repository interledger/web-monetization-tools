import { cx } from 'class-variance-authority'
import React, { useState, useRef, useEffect } from 'react'
import { SVGEdit } from '~/assets/svg'

export interface TabOption {
  id: string
  label: string
}

interface TabSelectorProps {
  options: TabOption[]
  defaultSelectedId?: string
  onSelectTab?: (tabId: string) => void
  className?: string
  onTabLabelChange?: (tabId: string, newLabel: string) => void
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  options,
  defaultSelectedId,
  onSelectTab,
  className = '',
  onTabLabelChange
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId || (options.length > 0 ? options[0].id : '')
  )

  const [editingId, setEditingId] = useState<string | null>(null)
  const [tabLabels, setTabLabels] = useState<Record<string, string>>({})
  const [inputValue, setInputValue] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initialLabels: Record<string, string> = {}
    options.forEach((tab) => {
      initialLabels[tab.id] = tab.label
    })
    setTabLabels(initialLabels)
  }, [options])

  // focus input when entering edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  // handle clicks outside the input to save changes
  useEffect(() => {
    if (!editingId) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        saveEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingId, inputValue])

  /** Handle tab selection and toggle edit mode when clicking on already selected tab */
  const handleTabClick = (tabId: string) => {
    if (selectedId === tabId && !editingId) {
      beginEditing(tabId)
    } else {
      if (editingId) {
        saveEdit()
      }

      setSelectedId(tabId)
      if (onSelectTab) {
        onSelectTab(tabId)
      }
    }
  }

  const beginEditing = (tabId: string) => {
    const currentLabel =
      tabLabels[tabId] || options.find((tab) => tab.id === tabId)?.label || ''

    setEditingId(tabId)
    setInputValue(currentLabel)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // keyboard input while editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const saveEdit = () => {
    if (editingId && inputValue.trim() !== '') {
      setTabLabels((prev) => ({
        ...prev,
        [editingId]: inputValue
      }))

      if (onTabLabelChange) {
        onTabLabelChange(editingId, inputValue)
      }
    }

    setEditingId(null)
  }
  return (
    <div className={`flex ${className}`}>
      {options.map((tab) => {
        const isSelected = selectedId === tab.id
        const isEditing = editingId === tab.id
        const displayLabel = tabLabels[tab.id] || tab.label

        return (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              rounded-t-sm min-w-[150px] cursor-pointer
              ${
                isSelected
                  ? 'bg-white text-purple-300'
                  : 'text-silver-600 hover:bg-purple-50'
              }
            `}
            aria-selected={isSelected}
            role="tab"
          >
            <div className="flex flex-row items-center w-[179px] h-[50px] gap-1 px-1">
              <div
                className="cursor-pointer"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  if (isSelected) beginEditing(tab.id)
                }}
              >
                <SVGEdit className={cx(isEditing ? 'visible' : 'invisible')} />
              </div>

              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none outline-none text-purple-600 text-base leading-md font-normal w-full box-border"
                  maxLength={20}
                  autoFocus
                />
              ) : (
                <p
                  className={`
                    text-base leading-md font-normal
                    ${isSelected ? 'text-purple-300' : 'text-silver-600'}
                  `}
                >
                  {displayLabel}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TabSelector
