export interface CreateConfigRequest {
  walletAddress: string
  tag: string
  version?: string
}

export interface SaveUserConfigRequest {
  walletAddress: string
  fullconfig: string // JSON stringified object containing all versions
  version: string
  // ... other fields
}

export interface ConfigVersions {
  [key: string]: {
    // button config
    buttonFontName: string
    buttonText?: string
    buttonBorder: 'Light' | 'None'
    buttonTextColor: string
    buttonBackgroundColor: string
    buttonDescriptionText?: string

    // banner config
    bannerFontName: string
    bannerFontSize: number
    bannerTitleText?: string
    bannerDescriptionText?: string
    bannerSlideAnimation: 'Down' | 'None'
    bannerPosition: 'Bottom' | 'Top'
    bannerTextColor: string
    bannerBackgroundColor: string
    bannerBorder: 'Light' | 'None'

    // widget config
    widgetFontName: string
    widgetFontSize: number
    widgetDonateAmount: number
    widgetTitleText?: string
    widgetDescriptionText?: string
    widgetButtonText?: string
    widgetButtonBackgroundColor: string
    widgetButtonTextColor: string
    widgetButtonBorder: 'Light' | 'None'
    widgetTextColor: string
    widgetBackgroundColor: string
    widgetTriggerBackgroundColor: string
    widgetTriggerIcon?: string

    // general config
    css: string
    walletAddress: string
    version?: string
    tag?: string // when creating a new config
  }
}

export type SanitizedFields = {
bannerTitleText?: string;
bannerDescriptionText?: string;
widgetTitleText?: string;
widgetDescriptionText?: string;
widgetButtonText?: string;
buttonText?: string;
buttonDescriptionText?: string;
walletAddress?: string;
tag?: string;
version?: string;
}
