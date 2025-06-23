import React, { useState } from 'react'
import { SectionHeader } from './SectionHeader'
import {
  SVGAnimation,
  SVGColorPicker,
  SVGPosition,
  SVGRoundedCorner,
  SVGText,
  SVGThumbnail,
  SVGRefresh,
  SVGArrowCollapse,
  SVGGreenVector
} from '../../../assets/svg'
import { ToolsDropdown } from './ToolsDropdown'
import { ColorSelector } from './ColorSelector'
import { CornerRadiusSelector } from './CornerRadiusSelector'
import { PositionSelector } from './PositionSelector'
import { Slider } from './Slider'
import Checkbox from './Checkbox'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'
import { Heading5 } from '../Typography'
import { Divider } from './Divider'
import { Thumbnail } from './Thumbnail'

export const BuilderCollapseExpand: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab] = useState('Appearance')
  const [fontSize, setFontSize] = useState(16)
  const minFontSize = 14
  const maxFontSize = 24
  const [_cornerRadius, setCornerRadius] = useState('light')
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const [isAnimated, setIsAnimated] = useState(true)
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(true)
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const thumbnails = ['/app/assets/images/wm_logo.svg']

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleDoneClick = () => {
    setIsExpanded(false)
    setIsComplete(true)
  }

  if (!isExpanded) {
    return (
      <div
        className="w-[608px] bg-interface-bg-main rounded-lg cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="px-4 pr-1 py-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete && <SVGGreenVector />}
              <Heading5>{activeTab}</Heading5>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand()
              }}
              className="w-12 h-12 rounded-lg flex items-center justify-center"
            >
              <SVGArrowCollapse />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[608px] bg-white rounded-lg">
      <div className="flex flex-col gap-3">
        {/* Header section */}
        <div
          className="px-1 py-2 flex items-center justify-between cursor-pointer"
          onClick={toggleExpand}
        >
          <Heading5>{activeTab}</Heading5>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(false)
              }}
              className="w-12 h-12 rounded-lg flex items-center justify-center"
            >
              <div className="rotate-180">
                <SVGArrowCollapse />
              </div>
            </button>
            <button
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Refresh')
              }}
            >
              <SVGRefresh />
            </button>
          </div>
        </div>
        {/* Text section */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={<SVGText />} label="Text" />
          <ToolsDropdown
            label="Font Family"
            defaultValue="2"
            options={[
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
              { label: 'Option 4', value: '4' }
            ]}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs leading-xs text-silver-700">Size</label>
            <div className="flex items-center h-12 gap-4">
              <button
                className="flex items-center justify-center w-6 h-7 cursor-pointer hover:font-bold"
                onClick={() => {
                  const newSize = Math.max(minFontSize, fontSize - 1)
                  setFontSize(newSize)
                }}
                aria-label="Decrease font size"
              >
                <span className="text-sm leading-sm text-text-primary">A</span>
              </button>

              <Slider
                value={fontSize}
                min={minFontSize}
                max={maxFontSize}
                onChange={(value) => {
                  console.log('Font size changed to:', value)
                  setFontSize(value)
                }}
              />

              <button
                className="flex items-center justify-center w-6 h-7 cursor-pointer hover:font-bold"
                onClick={() => {
                  const newSize = Math.min(maxFontSize, fontSize + 1)
                  setFontSize(newSize)
                }}
                aria-label="Increase font size"
              >
                <span className="text-3xl leading-3xl text-text-primary">
                  A
                </span>
              </button>
            </div>
          </div>
        </div>
        <Divider />
        {/* Colors section */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={<SVGColorPicker />} label="Colors" />

          <div className="flex justify-between">
            <ColorSelector label="Background color" value="#ffffff" />
            <ColorSelector label="Text" value="#363636" />
            <ColorSelector label="Border" value="#dfdfdf" />
          </div>
        </div>
        <Divider />
        {/* Corner radius section */}
        <div className="flex flex-col gap-2">
          <SectionHeader
            icon={<SVGRoundedCorner />}
            label="Container Corner Radius"
          />
          <CornerRadiusSelector
            defaultValue="light"
            onChange={(value) => setCornerRadius(value)}
          />
        </div>
        <Divider />
        {/* Position section */}
        <div className="flex flex-col gap-2">
          <SectionHeader
            icon={<SVGPosition />}
            label="Position (Appears from)"
          />
          <PositionSelector
            defaultValue={position}
            onChange={(value) => setPosition(value)}
          />
        </div>
        <Divider /> {/* Animation section */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={<SVGAnimation />} label="Animation" />
          <div className="flex items-center">
            <div className="w-[89px]">
              <Checkbox
                checked={isAnimated}
                onChange={() => setIsAnimated(!isAnimated)}
                label="Animated"
              />
            </div>
            <div className="flex-1">
              <ToolsDropdown
                label="Duration"
                defaultValue="1"
                options={[
                  { label: '300ms', value: '1' },
                  { label: '600ms', value: '2' }
                ]}
              />
            </div>
          </div>
        </div>
        <Divider />
        {/* Thumbnail section */}
        <div className="flex flex-col gap-2">
          <SectionHeader icon={<SVGThumbnail />} label="Thumbnail" />
          <div className="flex items-center">
            <div className="w-[89px]">
              <Checkbox
                checked={isThumbnailVisible}
                onChange={() => setIsThumbnailVisible(!isThumbnailVisible)}
                label="Visible"
              />
            </div>
            <div className="flex-grow flex gap-4">
              {thumbnails.map((thumbnail, index) => (
                <Thumbnail
                  key={index}
                  isSelected={selectedThumbnail === index}
                  imageUrl={thumbnail}
                  onClick={() => setSelectedThumbnail(index)}
                />
              ))}
            </div>
          </div>
        </div>
        <Divider />
        {/* Footer button */}
        <div className="flex justify-end mb-4">
          <ToolsSecondaryButton className="w-[140px]" onClick={handleDoneClick}>
            Done
          </ToolsSecondaryButton>
        </div>
      </div>
    </div>
  )
}

export default BuilderCollapseExpand
