import { html, css, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import type { WalletAddress } from './payment-component'

export interface PaymentDetails {
  walletAddress: string
  receiveAmount: string
  debitAmount: string
  receiverName?: string
  quote: object
  isQuote: boolean
  note?: string
}

export class PaymentConfirmation extends LitElement {
  @property({ type: Object }) walletAddress: WalletAddress | null = null
  @property({ type: String }) receiverAddress = ''
  @property({ type: String }) note = ''

  @state() private inputAmount = ''
  @state() private paymentDetails: PaymentDetails | null = null
  @state() private isLoadingPreview = false
  @state() private debounceTimer: number | null = null

  static styles = css`
    :host {
      display: block;
      font-family: var(--wm-font-family, system-ui, sans-serif);
      --primary-color: var(--wm-primary-color, #10b981);
      --background-color: var(--wm-background-color, #ffffff);
      --text-color: var(--wm-text-color, #000000);
      width: 100%;
    }

    .confirmation-container {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .amount-input-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      position: relative;
    }

    .currency-symbol {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-right: 8px;
      user-select: none;
    }

    .amount-input {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color);
      background: transparent;
      border: none;
      outline: none;
      text-align: left;
      min-width: 60px;
      max-width: 200px;
      caret-color: var(--primary-color);
    }

    .amount-input::placeholder {
      color: var(--primary-color);
      opacity: 0.5;
    }

    .amount-input:focus {
      outline: none;
    }

    /* Hide number input arrows */
    .amount-input::-webkit-outer-spin-button,
    .amount-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .amount-input[type='number'] {
      -moz-appearance: textfield;
    }

    .preset-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .preset-btn {
      padding: 12px 20px;
      border: 2px solid var(--primary-color);
      border-radius: 50px;
      background: transparent;
      color: var(--primary-color);
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s ease;
      min-width: 80px;
    }

    .preset-btn:hover {
      background: var(--primary-color);
      color: white;
    }

    .preset-btn.selected {
      background: var(--primary-color);
      color: white;
    }

    .payment-details {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      flex: 1;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .detail-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .quote-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .detail-summary {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .summary-row.total {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-weight: 600;
      font-size: 1rem;
    }

    .summary-label {
      color: var(--text-color);
      opacity: 0.7;
    }

    .summary-value {
      color: var(--text-color);
      font-weight: 500;
    }

    .receiver-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }

    .receiver-name {
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 4px;
    }

    .receiver-address {
      color: #0369a1;
      opacity: 0.8;
      word-break: break-all;
    }

    .note-display {
      font-size: 0.875rem;
      color: var(--text-color);
      opacity: 0.7;
      font-style: italic;
      margin-bottom: 12px;
    }

    .detail-note {
      margin-bottom: 16px;
    }

    .confirm-button {
      width: 100%;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .confirm-button:hover:not(:disabled) {
      background: #059669;
    }

    .confirm-button:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--text-color);
      opacity: 0.6;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      text-align: center;
      color: var(--text-color);
      opacity: 0.6;
      padding: 40px 20px;
    }

    .empty-state-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state-description {
      font-size: 0.875rem;
    }

    .back-button {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 16px;
      align-self: flex-start;
    }

    .back-button:hover {
      background: var(--primary-color);
      color: white;
    }

    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
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
  `

  connectedCallback() {
    super.connectedCallback()
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector(
        '.amount-input'
      ) as HTMLInputElement
      if (input) {
        input.focus()
      }
    })
  }

  private getCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      usd: '$',
      eur: '€',
      gbp: '£'
    }
    return symbols[this.walletAddress!.assetCode.toLowerCase()]
  }

  private debouncedProcessPayment(amount: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      this.processPaymentForAmount(amount)
    }, 700)
  }

  private async processPaymentForAmount(amount: string) {
    if (!amount || amount === '0' || parseFloat(amount) <= 0) {
      this.paymentDetails = null
      this.requestUpdate()
      return
    }

    this.isLoadingPreview = true
    this.paymentDetails = null
    this.requestUpdate()

    try {
      // USE THIS INSTEAD
      const paymentData = {
        walletAddress: this.walletAddress!.id,
        receiver: this.receiverAddress,
        amount: Number(amount),
        note: this.note
      }

      const payment = await this.getPaymentQuote(paymentData)

      this.paymentDetails = {
        walletAddress: payment.walletAddress,
        receiveAmount: payment.receiveAmount,
        debitAmount: payment.debitAmount,
        receiverName: payment.receiverName,
        quote: payment.quote,
        isQuote: payment.isQuote,
        note: paymentData.note
      }

      this.isLoadingPreview = false
    } catch (error) {
      console.error('Error loading payment preview:', error)
      this.isLoadingPreview = false
    }

    this.requestUpdate()
  }

  private handlePresetClick(amount: string) {
    this.inputAmount = amount

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.processPaymentForAmount(amount)
  }

  private handleAmountInput(e: Event) {
    const input = e.target as HTMLInputElement
    let value = input.value

    // allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, '')

    // ensure only one decimal point
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }

    // limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2)
    }

    this.inputAmount = value
    this.debouncedProcessPayment(value)
    this.requestUpdate()
  }

  private handleAmountKeyDown(e: KeyboardEvent) {
    // allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return
    }
    // allow: numbers, decimal point
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 190 &&
      e.keyCode !== 110
    ) {
      e.preventDefault()
    }
  }

  private async getPaymentQuote(paymentData: {
    walletAddress: string
    receiver: string
    amount: number
    note: string
  }): Promise<{
    walletAddress: string
    receiveAmount: string
    debitAmount: string
    receiverName: string
    quote: object
    isQuote: boolean
  }> {
    const response = await fetch(`http://localhost:8787/tools/payment/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderWalletAddress: paymentData.walletAddress,
        receiverWalletAddress: paymentData.receiver,
        amount: paymentData.amount,
        note: paymentData.note
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Payment failed')
    }

    return await response.json()
  }

  private async handlePaymentConfirmed() {
    try {
      const outgoingPaymentGrant = await this.requestOutgoingGrant({
        senderWalletAddress: this.paymentDetails?.walletAddress || '',
        // @ts-expect-error todo: add types
        debitAmount: this.paymentDetails?.quote?.debitAmount || {},
        // @ts-expect-error todo: add types
        receiveAmount: this.paymentDetails?.quote?.receiveAmount || {}
      })

      this.dispatchEvent(
        new CustomEvent('payment-confirmed', {
          detail: {
            // @ts-expect-error todo: add types
            grant: { ...outgoingPaymentGrant },
            quote: this.paymentDetails?.quote
          },
          bubbles: true,
          composed: true
        })
      )
    } catch (error) {
      console.error('Error initializing payment:', error)
    }
  }

  private async requestOutgoingGrant(paymentData: {
    senderWalletAddress: string
    debitAmount: object
    receiveAmount: object
  }) {
    const response = await fetch(`http://localhost:8787/tools/payment/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderWalletAddress: paymentData.senderWalletAddress,
        debitAmount: paymentData.debitAmount,
        receiveAmount: paymentData.receiveAmount
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Payment failed')
    }

    const outgoingGrant = await response.json()
    return outgoingGrant
  }

  private goBack() {
    this.dispatchEvent(
      new CustomEvent('back', {
        detail: this.paymentDetails,
        bubbles: true,
        composed: true
      })
    )
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }

  render() {
    return html`
      <div class="confirmation-container">
        <button class="back-button" @click=${this.goBack}>← Back</button>

        <div class="amount-input-container">
          <span class="currency-symbol">${this.getCurrencySymbol()}</span>
          <input
            class="amount-input"
            type="text"
            inputmode="decimal"
            placeholder="0"
            .value=${this.inputAmount}
            @input=${this.handleAmountInput}
            @keydown=${this.handleAmountKeyDown}
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <div class="preset-buttons">
          <button
            class="preset-btn ${this.inputAmount === '1' ? 'selected' : ''}"
            @click=${() => this.handlePresetClick('1')}
          >
            ${this.getCurrencySymbol()}1
          </button>
          <button
            class="preset-btn ${this.inputAmount === '5' ? 'selected' : ''}"
            @click=${() => this.handlePresetClick('5')}
          >
            ${this.getCurrencySymbol()}5
          </button>
          <button
            class="preset-btn ${this.inputAmount === '10' ? 'selected' : ''}"
            @click=${() => this.handlePresetClick('10')}
          >
            ${this.getCurrencySymbol()}10
          </button>
        </div>

        ${this.inputAmount
          ? this.renderPaymentDetails()
          : this.renderEmptyState()}
      </div>
    `
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-state-title">Enter an amount</div>
        <div class="empty-state-description">
          Type an amount or select one of the preset values above
        </div>
      </div>
    `
  }

  private renderPaymentDetails() {
    if (this.isLoadingPreview) {
      return html`
        <div class="payment-details">
          <div class="loading-state">
            <div class="spinner"></div>
            Loading payment details...
          </div>
        </div>
      `
    }

    if (!this.paymentDetails) {
      return html`
        <div class="payment-details">
          <div class="loading-state">
            Failed to load payment details. Please try again.
          </div>
        </div>
      `
    }

    return html`
      <div class="payment-details">
        <div class="detail-header">
          ${this.paymentDetails.isQuote
            ? html`<span class="quote-badge">Payment Details</span>`
            : ''}
        </div>

        ${this.note
          ? html` <div class="note-display">"${this.note}"</div> `
          : ''}

        <div class="detail-summary">
          <div class="summary-row">
            <span class="summary-label">You send:</span>
            <span class="summary-value"
              >${this.paymentDetails.debitAmount}</span
            >
          </div>
          <div class="summary-row">
            <span class="summary-label">They will receive:</span>
            <span class="summary-value"
              >${this.paymentDetails.receiveAmount}</span
            >
          </div>
        </div>
      </div>
      <div class="detail-note">
        <label class="form-label">Payment note:</label>
        <input
          class="form-input"
          type="text"
          name="note"
          placeholder="Note"
          .value=${this.note}
        />
      </div>

      <button class="confirm-button" @click=${this.handlePaymentConfirmed}>
        Confirm Payment
      </button>
    `
  }
}

customElements.define('wm-payment-confirmation', PaymentConfirmation)
