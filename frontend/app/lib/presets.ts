import { CornerType, SlideAnimationType, PositionType } from './types.js'

export const validConfigTypes = ['button', 'banner', 'widget']

export const textColorPresets = ['#ffffff', '#000000']
export const backgroundColorPresets = [
  '#ff808c',
  '#4ec6c0',
  '#a2bddb',
  '#f8c6db',
  '#f69656',
  '#93e5d6',
  '#7f76b2'
]
export const FontsType = ['Arial', 'Open Sans', 'Cookie', 'Titillium Web']

export const bgColors = {
  button: 'from-wm-green to-wm-green-fade',
  banner: 'from-wm-dark-green to-wm-dark-green-fade',
  widget: 'from-wm-red to-wm-red-fade'
}

export const fontOptions = FontsType.map((font) => {
  return {
    value: font,
    label: font
  }
})

export const controlOptions = [
  {
    value: 'background',
    label: 'Background'
  },
  {
    value: 'text',
    label: 'Text'
  }
]

export const widgetControlOptions = [
  {
    value: 'background',
    label: 'Background'
  },
  {
    value: 'text',
    label: 'Text'
  },
  {
    value: 'buttonbackground',
    label: 'Btn background'
  },
  {
    value: 'buttontext',
    label: 'Btn Text'
  }
]

export const slideOptions = [
  {
    value: SlideAnimationType.None,
    label: 'No'
  },
  {
    value: SlideAnimationType.Down,
    label: 'Yes'
  }
]

export const positionOptions = [
  {
    value: PositionType.Bottom,
    label: 'Bottom'
  },
  {
    value: PositionType.Top,
    label: 'Top'
  }
]

export const cornerOptions = [
  {
    value: CornerType.None,
    label: 'No rounding'
  },
  {
    value: CornerType.Light,
    label: 'Light rounding'
  },
  {
    value: CornerType.Pill,
    label: 'Pill'
  }
]

export const availableTools = [
  {
    enabled: true,
    title: 'Banner',
    image: 'banner_representation.svg',
    bgColor: 'from-wm-dark-green to-wm-dark-green-fade',
    link: 'create/banner',
    tooltip:
      "The embedded banner will be shown if webmonetization extension isn't active and until user closes it. You can set colors and displayed title and text. The link to the extension is browser type based and is automatically added.",
    description:
      'A banner to display on your website for visitors who do not have WM extension active. A call-to-action with a link to the extension or description of the options. It will also add a paiment pointer to your website.'
  },
  {
    enabled: true,
    title: 'Widget',
    image: 'widget_representation.svg',
    bgColor: 'from-wm-red to-wm-red-fade',
    link: 'create/widget',
    tooltip:
      'The embedded widget is displayed on the lower right corner of the website, it opens an overlayed section with title, text and a payment solution. You can customize the colors and text. The preset values are fixed, but there is an option for custom values for the visitor.',
    description:
      'A widget to display a small explanation or description of your choice and a solution for donations or a one-time payment, even for visitors who do not have the WM extension active.'
  },
  {
    enabled: false,
    title: 'Button',
    image: 'button_representation.svg',
    bgColor: 'from-wm-green to-wm-green-fade',
    link: 'create/button',
    tooltip: '',
    description:
      'Add a custom button to your website with a short tooltip, that triggers a payment option for donations or one-time payments in a full page overlay, for a convenient option for your visitors to support your work / content.'
  },
  {
    enabled: false,
    title: 'Exclusive content',
    image: 'exclusive_representation.svg',
    bgColor: 'from-wm-green to-wm-green-fade',
    link: 'create/exclusive',
    tooltip: '',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dictum felis eget dui ullamcorper, sit amet hendrerit ante sollicitudin. Donec eget metus lectus.'
  }
].filter((tool) => tool.enabled)
