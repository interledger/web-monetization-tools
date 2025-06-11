import type { WidgetConfig } from '@tools/components'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wm-payment-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          config?: WidgetConfig
          requestPayment?: boolean
          requestQuote?: boolean
        },
        HTMLElement
      >
    }
  }
}

export {}
