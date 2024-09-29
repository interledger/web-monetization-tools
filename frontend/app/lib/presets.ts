import { CornerType, SlideAnimationType, PositionType } from "./types"

export const textColorPresets = ["#ffffff", "#000000"]
export const backgroundColorPresets = [
  "#ff808c",
  "#4ec6c0",
  "#a2bddb",
  "#f8c6db",
  "#f69656",
  "#93e5d6",
  "#7f76b2"
]
export const FontsType = ["Arial", "Open Sans", "Cookie", "Titillium Web"]

export const bgColors = {
  button: "from-wm-green to-wm-green-fade",
  banner: "from-wm-dark-green to-wm-dark-green-fade",
  widget: "from-wm-red to-wm-red-fade",
}

export const fontOptions = FontsType.map((font) => {
  return {
    value: font,
    label: font
  }
})

export const controlOptions = [
  {
    value: "background",
    label: "Background"
  },
  {
    value: "text",
    label: "Text"
  }
]

export const widgetControlOptions = [
  {
    value: "background",
    label: "Background"
  },
  {
    value: "text",
    label: "Text"
  },
  {
    value: "buttonbackground",
    label: "Btn background"
  },
  {
    value: "buttontext",
    label: "Btn Text"
  }
]

export const slideOptions = [
  {
    value: SlideAnimationType.None,
    label: "No"
  },
  {
    value: SlideAnimationType.Down,
    label: "Yes"
  }
]

export const positionOptions = [
  {
    value: PositionType.Bottom,
    label: "Bottom"
  },
  {
    value: PositionType.Top,
    label: "Top"
  }
]

export const cornerOptions = [
  {
    value: CornerType.None,
    label: "No rounding"
  },
  {
    value: CornerType.Light,
    label: "Light rounding"
  },
  {
    value: CornerType.Pill,
    label: "Pill"
  }
]
