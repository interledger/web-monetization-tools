import { html, css, LitElement } from 'lit'
import { property } from 'lit/decorators.js'

export class PaymentInteraction extends LitElement {
  @property({ type: String }) interactUrl = ''

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .interaction-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid var(--primary-color, #10b981);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .status-title {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color, #000);
    }

    .status-description {
      margin: 0 0 24px 0;
      font-size: 0.875rem;
      opacity: 0.7;
      color: var(--text-color, #000);
    }

    .cancel-button {
      padding: 8px 16px;
      background: transparent;
      border: 2px solid #dc2626;
      border-radius: 6px;
      color: #dc2626;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .cancel-button:hover {
      background: #dc2626;
      color: white;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      color: #dc2626;
      font-size: 0.875rem;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    if (!this.interactUrl) return

    window.open(this.interactUrl, '_blank')
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent) {
    console.log('Received message from interaction window:', event.data)

    if (event.data?.type !== 'GRANT_INTERACTION') return
    const { paymentId, hash, interact_ref, result } = event.data

    if (result === 'grant_rejected') {
      return this.dispatchEvent(
        new CustomEvent('interaction-rejected', {
          bubbles: true,
          composed: true
        })
      )
    }

    if (!paymentId || !interact_ref) {
      return this.dispatchEvent(
        new CustomEvent('interaction-error', {
          bubbles: true,
          composed: true
        })
      )
    }

    console.log('!!! Interaction completed:')
    console.log('Payment ID:', paymentId)
    console.log('Hash:', hash)
    console.log('Interact Reference:', interact_ref)

    return this.dispatchEvent(
      new CustomEvent('interaction-completed', {
        detail: { interact_ref, hash, paymentId },
        bubbles: true,
        composed: true
      })
    )
  }

  private cancel() {
    this.dispatchEvent(
      new CustomEvent('interaction-cancelled', {
        bubbles: true,
        composed: true
      })
    )
  }

  render() {
    return html`
      <div class="interaction-container">
        <div class="spinner"></div>
        <h3 class="status-title">Authorizing Payment</h3>
        <p class="status-description">
          Please complete the authorization in the opened tab
        </p>
        <button class="cancel-button" @click=${this.cancel}>Cancel</button>
      </div>
    `
  }
}

customElements.define('wm-payment-interaction', PaymentInteraction)
