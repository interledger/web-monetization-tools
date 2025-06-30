import {
  html,
  css,
  LitElement,
  type ReactiveController,
  type ReactiveControllerHost
} from 'lit'
import { property, state } from 'lit/decorators.js'
// Use a data URL for the default logo as fallback
const defaultLogo =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM3Rjc2QjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4='

export interface BannerConfig {
  walletAddress?: string
  bannerTitleText?: string
  bannerDescriptionText?: string
  bannerFontName?: string
  bannerFontSize?: number
  bannerTextColor?: string
  bannerBackgroundColor?: string
  bannerBorder?: string
  bannerPosition?: 'top' | 'bottom'
  bannerSlideAnimation?: boolean
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
    fontSize?: number
  }
  logo?: string
}

export class PaymentBanner extends LitElement {
  private configController = new BannerController(this)

  @property({ type: Object })
  set config(value: Partial<BannerConfig>) {
    this.configController.updateConfig(value)
  }
  get config() {
    return this.configController.config
  }

  @property({ type: Boolean }) isVisible = true

  @state() private isDismissed = false
  static styles = css`
    :host {
      display: block;
      font-family: var(--wm-font-family, system-ui, sans-serif);
      --primary-color: var(--wm-primary-color, #7f76b2);
      --background-color: var(--wm-background-color, #ffffff);
      --text-color: var(--wm-text-color, #000000);
      --font-size: var(--wm-font-size, 16px);
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--background-color);
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 12px;
      position: relative;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

    .banner.hidden {
      display: none;
    }

    .banner-logo {
      width: 50px;
      flex-shrink: 0;
    }

    .banner-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .banner-title {
      margin: 0;
      font-size: var(--font-size);
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
    }

    .banner-description {
      margin: 0;
      font-size: calc(var(--font-size) * 0.75);
      color: var(--text-color);
      line-height: 1.3;
      opacity: 0.9;
    }

    .banner-link {
      margin: 0;
      font-size: calc(var(--font-size) * 0.75);
      color: var(--primary-color);
      text-decoration: underline;
      cursor: pointer;
      line-height: 1.3;
    }

    .banner-link:hover {
      opacity: 0.8;
    }

    .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }
  `

  private handleClose() {
    this.isDismissed = true
    this.requestUpdate()

    this.dispatchEvent(
      new CustomEvent('banner-closed', {
        detail: { dismissed: true },
        bubbles: true,
        composed: true
      })
    )
  }

  private handleLinkClick() {
    this.dispatchEvent(
      new CustomEvent('banner-link-clicked', {
        detail: { action: 'download-extension' },
        bubbles: true,
        composed: true
      })
    )
  }

  render() {
    if (!this.isVisible || this.isDismissed) {
      return html``
    }

    const logo = this.config.logo || defaultLogo
    const title = this.config.bannerTitleText || 'How to support?'
    const description =
      this.config.bannerDescriptionText ||
      'You can support this page and my work by a one time donation or proportional to the time you spend on this website through web monetization.'

    return html`
      <div class="banner">
        <img src="${logo}" alt="Web Monetization Logo" class="banner-logo" />

        <div class="banner-content">
          <h3 class="banner-title">${title}</h3>
          <p class="banner-description">${description}</p>
          <p class="banner-link" @click=${this.handleLinkClick}>
            Download web monetization extension
          </p>
        </div>

        <button
          class="close-button"
          @click=${this.handleClose}
          aria-label="Close banner"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `
  }
}

customElements.define('wm-payment-banner', PaymentBanner)

interface BannerState {
  isVisible: boolean
  isDismissed: boolean
}

export class BannerController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement
  private _config!: BannerConfig
  private _state: BannerState = {
    isVisible: true,
    isDismissed: false
  }

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host
    host.addController(this)
  }

  /** called when the host is connected to the DOM */
  hostConnected() {}

  /** called when the host is disconnected from the DOM */
  hostDisconnected() {}

  get config(): BannerConfig {
    return this._config
  }

  get state(): BannerState {
    return this._state
  }

  updateConfig(updates: Partial<BannerConfig>) {
    this._config = { ...this._config, ...updates }

    this.applyTheme(this.host)
    this.host.requestUpdate()
  }

  updateState(updates: Partial<BannerState>) {
    this._state = { ...this._state, ...updates }
    this.host.requestUpdate()
  }

  applyTheme(element: HTMLElement) {
    const theme = this._config.theme
    if (!theme) return

    if (theme.primaryColor) {
      element.style.setProperty('--wm-primary-color', theme.primaryColor)
    }
    if (theme.backgroundColor) {
      element.style.setProperty('--wm-background-color', theme.backgroundColor)
    }
    if (theme.textColor) {
      element.style.setProperty('--wm-text-color', theme.textColor)
    }
    if (theme.fontFamily) {
      element.style.setProperty('--wm-font-family', theme.fontFamily)
    }
    if (theme.fontSize) {
      element.style.setProperty('--wm-font-size', `${theme.fontSize}px`)
    }
  }
}
