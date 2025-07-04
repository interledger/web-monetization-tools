import { cx } from 'class-variance-authority'
import React, { useState, useRef, useEffect } from 'react'
import { SVGEdit } from '~/assets/svg'
import { TabTooltip } from './TabTooltip'
import { toolActions } from '~/stores/toolStore'

export interface TabOption {
  id: string
  label: string
}

interface TabSelectorProps {
  options: TabOption[]
  selectedId?: string
  onSelectTab?: (tabId: string) => void
  className?: string
  onTabLabelChange?: (tabId: string, newLabel: string) => void
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  options,
  selectedId,
  onSelectTab,
  className = '',
  onTabLabelChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tabLabels, setTabLabels] = useState<Record<string, string>>({})
  const [inputValue, setInputValue] = useState<string>('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [dragDistance, setDragDistance] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  useEffect(() => {
    const initialLabels: Record<string, string> = {}
    options.forEach((tab) => {
      initialLabels[tab.id] = tab.label
    })
    setTabLabels(initialLabels)
  }, [options])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

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

  const handleTabClick = (tabId: string) => {
    // Prevent click if user was dragging
    if (dragDistance > 5) {
      setDragDistance(0)
      return
    }

    if (selectedId === tabId && !editingId) {
      beginEditing(tabId)
    } else {
      if (editingId) {
        saveEdit()
      }

      toolActions.selectVersion(tabId)
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
    const newValue = e.target.value
    if (/^[a-zA-Z0-9-_ ]*$/.test(newValue)) {
      setInputValue(newValue)
    }
  }

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

  const startDragging = (e: React.MouseEvent) => {
    if (editingId || !containerRef.current) return

    mouseDownRef.current = true
    setDragDistance(0)
    startXRef.current = e.pageX - containerRef.current.offsetLeft
    scrollLeftRef.current = containerRef.current.scrollLeft
  }

  const stopDragging = () => {
    mouseDownRef.current = false
  }

  const move = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!mouseDownRef.current || !containerRef.current) return

    const x = e.pageX - containerRef.current.offsetLeft
    const scroll = x - startXRef.current
    setDragDistance(Math.abs(scroll))
    containerRef.current.scrollLeft = scrollLeftRef.current - scroll
  }

  return (
    <div id="tab-selector" className={`w-full overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className={`flex w-full overflow-x-auto scrollbar-hide select-none ${
          mouseDownRef.current ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={startDragging}
        onMouseMove={move}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        {options.map((tab) => {
          const isSelected = selectedId === tab.id
          const isEditing = editingId === tab.id
          const displayLabel = tabLabels[tab.id] || tab.label

          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onMouseEnter={() => setHoveredId(tab.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                rounded-t-sm flex-1 cursor-pointer ${isEditing ? 'min-w-[200px]' : ''}
                ${
                  isSelected
                    ? 'bg-white text-purple-300'
                    : 'text-silver-600 hover:bg-purple-50'
                }
              `}
              aria-selected={isSelected}
              role="tab"
            >
              <div className="flex flex-row items-center w-full h-[50px] gap-1 px-3 py-2">
                <div
                  className="cursor-pointer flex-shrink-0"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    if (isSelected) beginEditing(tab.id)
                  }}
                >
                  <SVGEdit
                    className={cx(
                      'w-4 h-4',
                      isEditing || (isSelected && hoveredId === tab.id)
                        ? 'visible'
                        : 'invisible'
                    )}
                  />
                </div>

                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-purple-600 text-base leading-md font-normal w-full box-border"
                    maxLength={40}
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <TabTooltip
                      text={displayLabel}
                      className={`
                        truncate block
                        ${isSelected ? 'text-purple-300' : 'text-silver-600'}
                      `}
                    >
                      {displayLabel}
                    </TabTooltip>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TabSelector
