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
import wmLogo from '~/assets/images/wm_logo_animated.svg?url'
import { toolState, toolActions } from '~/stores/toolStore'
import { useSnapshot } from 'valtio'
import { SlideAnimationType } from '~/lib/types'

interface BuilderCollapseExpandProps {
  isComplete?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onDone?: () => void
}

export const BuilderCollapseExpand: React.FC<BuilderCollapseExpandProps> = ({
  isComplete,
  isExpanded = false,
  onToggle,
  onDone
}) => {
  const snap = useSnapshot(toolState)
  const minFontSize = 16
  const maxFontSize = 24
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(true)
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const isAnimated =
    snap.toolConfig?.bannerSlideAnimation !== SlideAnimationType.None

  const FontsType = ['Arial', 'Inherit', 'Open Sans', 'Cookie', 'Titillium Web']
  const defaultFontIndex = FontsType.findIndex(
    (option) => option == snap.toolConfig?.bannerFontName
  )
  const thumbnails = [wmLogo]

  const toggleExpand = () => {
    if (onToggle) {
      onToggle()
    }
  }

  const handleDoneClick = () => {
    if (onToggle) {
      onToggle()
    }
    if (onDone) {
      onDone()
    }
  }

  if (!isExpanded) {
    return (
      <div
        className="bg-interface-bg-main rounded-lg cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="px-4 pr-1 py-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete && <SVGGreenVector />}
              <Heading5>Appearance</Heading5>
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
    <div className="flex flex-col bg-interface-bg-container rounded-lg gap-sm">
      {/* Header section */}
      <div
        className="px-1 py-2 flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <Heading5>Appearance</Heading5>

        <div className="flex gap-2">
          <button
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              console.log('Refresh')
            }}
          >
            <SVGRefresh />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onToggle) {
                onToggle()
              }
            }}
            className="w-12 h-12 rounded-lg flex items-center justify-center"
          >
            <div className="rotate-180">
              <SVGArrowCollapse />
            </div>
          </button>
        </div>
      </div>

      {/* Text section */}
      <div className="flex flex-col gap-2">
        <SectionHeader icon={<SVGText />} label="Text" />
        <ToolsDropdown
          label="Font Family"
          defaultValue={defaultFontIndex.toString()}
          onChange={(value) => {
            const fontName = FontsType[parseInt(value)]
            toolActions.setToolConfig({ bannerFontName: fontName })
          }}
          options={FontsType.map((font, index) => ({
            label: font,
            value: index.toString()
          }))}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs leading-xs text-silver-700">Size</label>
          <div className="flex items-center h-12 gap-4">
            <button
              className="flex items-center justify-center w-6 h-7 cursor-pointer hover:font-bold"
              onClick={() => {
                const newSize = Math.max(
                  minFontSize,
                  (snap.toolConfig?.bannerFontSize ?? minFontSize) - 1
                )
                toolActions.setToolConfig({ bannerFontSize: newSize })
              }}
              aria-label="Decrease font size"
            >
              <span className="text-sm leading-sm text-text-primary">A</span>
            </button>

            <Slider
              value={snap.toolConfig?.bannerFontSize ?? minFontSize}
              min={minFontSize}
              max={maxFontSize}
              onChange={(value) => {
                console.log('Font size changed to:', value)
                toolActions.setToolConfig({ bannerFontSize: value })
              }}
            />

            <button
              className="flex items-center justify-center w-6 h-7 cursor-pointer hover:font-bold"
              onClick={() => {
                const newSize = Math.min(
                  maxFontSize,
                  (snap.toolConfig?.bannerFontSize ?? minFontSize) + 1
                )
                toolActions.setToolConfig({ bannerFontSize: newSize })
              }}
              aria-label="Increase font size"
            >
              <span className="text-3xl leading-3xl text-text-primary">A</span>
            </button>
          </div>
        </div>
      </div>

      <Divider />

      {/* Colors section */}
      <div className="flex flex-col gap-2">
        <SectionHeader icon={<SVGColorPicker />} label="Colors" />

        <div className="flex justify-between xl:flex-row flex-col gap-md">
          <ColorSelector
            label="Background"
            value={snap.toolConfig?.bannerBackgroundColor}
            onChange={(color) => {
              toolActions.setToolConfig({ bannerBackgroundColor: color })
            }}
          />
          <ColorSelector
            label="Text"
            value={snap.toolConfig?.bannerTextColor}
            onChange={(color) => {
              toolActions.setToolConfig({ bannerTextColor: color })
            }}
          />
          <div className="w-[150px] xl:block hidden"></div>
        </div>
      </div>

      <Divider />

      {/* Corner radius section */}
      <div className="flex flex-col gap-xs">
        <SectionHeader
          icon={<SVGRoundedCorner />}
          label="Container Corner Radius"
        />
        <CornerRadiusSelector
          defaultValue={snap.toolConfig?.bannerBorder}
          onChange={(value) =>
            toolActions.setToolConfig({ bannerBorder: value })
          }
        />
      </div>

      <Divider />

      {/* Position section */}
      <div className="flex flex-col gap-xs">
        <SectionHeader icon={<SVGPosition />} label="Position (Appears from)" />
        <PositionSelector
          defaultValue={snap.toolConfig?.bannerPosition}
          onChange={(value) =>
            toolActions.setToolConfig({ bannerPosition: value })
          }
        />
      </div>

      <Divider />

      {/* Animation section */}
      <div className="flex flex-col gap-xs">
        <SectionHeader icon={<SVGAnimation />} label="Animation" />
        <div className="flex gap-md xl:flex-row flex-col xl:items-center items-start">
          <Checkbox
            checked={isAnimated}
            onChange={() => {
              toolActions.setToolConfig({
                bannerSlideAnimation: isAnimated
                  ? SlideAnimationType.None
                  : SlideAnimationType.Down
              })
            }}
            label="Animated"
          />
          <div className="flex-1 w-full xl:w-auto">
            <ToolsDropdown
              label="Type"
              disabled={!isAnimated}
              defaultValue={SlideAnimationType.Down}
              options={[{ label: 'Slide up', value: SlideAnimationType.Down }]}
              onChange={(value) =>
                toolActions.setToolConfig({
                  bannerSlideAnimation: value as SlideAnimationType
                })
              }
            />
          </div>
        </div>
      </div>
      <Divider />
      {/* Thumbnail section */}
      <div className="flex flex-col gap-xs">
        <SectionHeader icon={<SVGThumbnail />} label="Thumbnail" />
        <div className="flex gap-md xl:flex-row flex-col xl:items-center items-start">
          <Checkbox
            checked={isThumbnailVisible}
            onChange={() => setIsThumbnailVisible(!isThumbnailVisible)}
            label="Visible"
          />
          <div className="flex gap-md">
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
      <div className="flex justify-end">
        <ToolsSecondaryButton
          className="w-full xl:w-[140px]"
          onClick={handleDoneClick}
        >
          Done
        </ToolsSecondaryButton>
      </div>
    </div>
  )
}

export default BuilderCollapseExpand
