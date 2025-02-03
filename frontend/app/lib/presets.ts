import { tooltips } from './tooltips.js'
import { CornerType, SlideAnimationType, PositionType } from './types.js'

export const validConfigTypes = ['button', 'banner', 'widget']

export const textColorPresets = ['#ffffff', '#000000']
export const triggerColorPresets = ['#ffffff', '#000000', '#096b63']
export const backgroundColorPresets = [
  '#ffffff',
  '#4ec6c0',
  '#f8c6db',
  '#f69656',
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
    label: 'Button background'
  },
  {
    value: 'buttontext',
    label: 'Button Text'
  },
  {
    value: 'trigger',
    label: 'Trigger & Icon'
  }
]

export const buttonControlOptions = [
  {
    value: 'background',
    label: 'Background'
  },
  {
    value: 'text',
    label: 'Text'
  },
  {
    value: 'tooltipbackground',
    label: 'Tooltip background'
  },
  {
    value: 'tooltiptext',
    label: 'Tooltip Text'
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

export const buttonTooltipOptions = [
  {
    value: '0',
    label: 'Hide'
  },
  {
    value: '1',
    label: 'Show'
  },
  {
    value: '2',
    label: 'Hover'
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
    tooltip: tooltips.banner,
    description:
      "The banner informs visitors who don't have the Web Monetization extension active, with a call-to-action linking to the extension or providing details about the options available. It also adds your wallet address for your site to be monetized."
  },
  {
    enabled: true,
    title: 'Widget',
    image: 'widget_representation.svg',
    bgColor: 'from-wm-red to-wm-red-fade',
    link: 'create/widget',
    tooltip: tooltips.widget,
    description:
      'You can add a widget to provide a brief explanation or description, along with a donation or one-time payment option, even for users without the Web Monetization extension. It also adds your wallet address for your site to be monetized.'
  },
  {
    enabled: true,
    title: 'Button',
    image: 'button_representation.svg',
    bgColor: 'from-wm-green to-wm-green-fade',
    link: 'create/button',
    tooltip: tooltips.button,
    description:
      'You can place a custom button with a short tooltip on your site that triggers a payment option in a full-page overlay, offering a convenient way for visitors to support your work or content.'
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
