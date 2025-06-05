import { html, css, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import './payment-confirmation.js'
import './payment-interaction.js'

export interface PaymentConfig {
  walletAddress: string
  receiverAddress: string
  amount: string
  currency: string
  action?: string
  note?: string
  widgetTitleText?: string
  widgetDescriptionText?: string
  widgetTriggerIcon?: string
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
  }
}

export type WalletAddress = {
  id: string
  publicName: string
  assetCode: string
  assetScale: number
  authServer: string
  resourceServer: string
}

export class PaymentWidget extends LitElement {
  @property({ type: Object }) config: PaymentConfig = {
    walletAddress: '',
    receiverAddress: '',
    amount: '0',
    currency: 'usd'
  }

  @property({ type: Object }) walletAddress: WalletAddress | null = null
  @property({ type: Boolean }) isOpen = false
  @property({ type: Object }) outgoingGrant: {
    interact?: { redirect?: string }
  } = {}
  @property({ type: Object }) quote = {}

  @state() private currentView: string = 'home'

  static styles = css`
    :host {
      display: block;
      font-family: var(--wm-font-family, system-ui, sans-serif);
      --primary-color: var(--wm-primary-color, #10b981);
      --background-color: var(--wm-background-color, #ffffff);
      --text-color: var(--wm-text-color, #000000);
    }

    .wm_widget {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .content {
      display: flex;
      flex-direction: column;
      background: var(--background-color);
      width: 24rem;
      height: 37rem;
      overflow: hidden;
      border: 1px solid #f3f4f6;
      transition: all 1s ease-in-out;
      border-radius: 6px;
      padding: 0.25rem;
      outline: none;
    }

    .content:focus {
      outline: none;
    }

    .content.open {
      max-width: 24rem;
      max-height: 37rem;
      opacity: 1;
    }

    .content.closed {
      max-width: 0;
      max-height: 0;
      opacity: 0;
    }

    .widget-header {
      display: flex;
      flex-direction: column;
      height: auto;
      padding: 16px;
    }

    .widget-header h5 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .widget-header p {
      margin: 0;
      max-height: 8rem;
      overflow: hidden;
      color: var(--text-color);
      opacity: 0.8;
    }

    .payment-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .payment-form {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 16px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-input:read-only {
      background-color: #f9fafb;
      color: #6b7280;
    }

    .support-button {
      width: 100%;
      padding: 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: auto;
    }

    .support-button:hover:not(:disabled) {
      background: #059669;
    }

    .support-button:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .trigger {
      cursor: pointer;
      background: var(--wm-widget-trigger-bg-color, #f3f4f6);
      width: 3.5rem;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1rem;
      border: transparent;
      border-radius: 50%;
    }

    .trigger img {
      width: 2rem;
    }

    .powered-by {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      margin-top: 16px;
      padding: 0 16px;
    }

    .powered-by a {
      color: var(--primary-color);
      text-decoration: none;
    }
  `

  private async handleSubmit(e: Event) {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const walletAddress = String(formData.get('walletAddress') ?? '')

    if (!walletAddress) {
      alert('Please enter a valid wallet address')
      return
    }

    const response = await fetch(walletAddress)
    if (!response.ok) {
      alert('Invalid wallet address or unable to fetch wallet details')
      return
    }

    this.walletAddress = (await response.json()) as WalletAddress
    this.currentView = 'confirmation'
  }

  private toggleWidget() {
    this.isOpen = !this.isOpen
    this.requestUpdate()

    this.dispatchEvent(
      new CustomEvent('widget-toggle', {
        detail: { isOpen: this.isOpen },
        bubbles: true,
        composed: true
      })
    )
  }

  private async handleInteractionCompleted(e: CustomEvent) {
    const { interact_ref } = e.detail

    const response = await fetch(`http://localhost:3000/tools/api/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: this.walletAddress?.id,
        grant: this.outgoingGrant,
        quote: this.quote,
        interactRef: interact_ref
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Payment failed')
    }

    this.currentView = 'home'
  }

  private handleInteractionCancelled() {
    this.currentView = 'confirmation'
  }

  private renderCurrentView() {
    switch (this.currentView) {
      case 'home':
        return this.renderHomeView()
      case 'confirmation':
        return this.renderConfirmationView()
      case 'interact':
        return this.renderInteractionView()
      default:
        console.warn(`Unknown view: ${this.currentView}`)
        return this.renderHomeView()
    }
  }

  private navigateToInteraction(e: CustomEvent) {
    const { grant, quote } = e.detail
    this.outgoingGrant = grant
    this.quote = quote
    this.currentView = 'interact'
  }

  private navigateToHome() {
    this.currentView = 'home'
  }

  private renderHomeView() {
    return html`
      <div class="payment-content">
        <div class="widget-header">
          <h5>${this.config.widgetTitleText || 'Support Me'}</h5>
          <p>
            ${this.config.widgetDescriptionText ||
            'Enter your wallet address to make a payment'}
          </p>
        </div>
        <form class="payment-form" @submit=${this.handleSubmit}>
          <div class="form-group">
            <label class="form-label">Pay From</label>
            <input
              class="form-input"
              type="text"
              name="walletAddress"
              placeholder="https://ilp.example.com/alice"
              .value=${this.config.walletAddress}
              required
            />
          </div>

          <button class="support-button" type="submit">
            ${this.config.action || 'Support Me'}
          </button>
        </form>

        <div class="powered-by">
          Powered by
          <a href="https://webmonetization.org" target="_blank">Interledger</a>
        </div>
      </div>
    `
  }

  private renderConfirmationView() {
    return html`
      <wm-payment-confirmation
        .walletAddress=${this.walletAddress}
        .receiverAddress=${this.config.receiverAddress ||
        'https://ilp.interledger-test.dev/darianusd'}
        .note=${this.config.note || ''}
        @back=${this.navigateToHome}
        @payment-confirmed=${this.navigateToInteraction}
      ></wm-payment-confirmation>
    `
  }

  private renderInteractionView() {
    return html`
      <wm-payment-interaction
        .interactUrl=${this.outgoingGrant.interact!.redirect}
        .senderWalletAddress=${this.walletAddress!.id}
        .grant=${this.outgoingGrant}
        .quote=${this.quote}
        @interaction-completed=${this.handleInteractionCompleted}
        @interaction-cancelled=${this.handleInteractionCancelled}
        @back=${this.navigateToHome}
      ></wm-payment-interaction>
    `
  }

  render() {
    const defaultTriggerIcon = '/app/assets/images/wm_logo_animated.svg'
    const triggerIcon = this.config.widgetTriggerIcon || defaultTriggerIcon

    return html`
      <div class="wm_widget">
        <div class="content ${this.isOpen ? 'open' : 'closed'}">
          ${this.renderCurrentView()}
        </div>

        <div class="trigger" @click=${this.toggleWidget}>
          <img src="http://localhost:3000${triggerIcon}" alt="widget trigger" />
        </div>
      </div>
    `
  }
}

customElements.define('wm-payment-widget', PaymentWidget)
