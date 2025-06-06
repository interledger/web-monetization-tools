import { z } from 'zod'

export const PaymentQuoteSchema = z.object({
  senderWalletAddress: z.string().url('Invalid sender wallet address'),
  receiverWalletAddress: z.string().url('Invalid receiver wallet address'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional()
})

export const AmountSchema = z.object({
  value: z.string(),
  assetCode: z.string(),
  assetScale: z.number().int().min(0)
})

export const PaymentGrantSchema = z.object({
  senderWalletAddress: z.string().url('Invalid sender wallet address'),
  debitAmount: AmountSchema,
  receiveAmount: AmountSchema
})

export const PaymentFinalizeSchema = z.object({
  walletAddress: z.string().url('Invalid wallet address'),
  grant: z.object({
    interact: z.object({
      redirect: z.string().url(),
      finish: z.string()
    }),
    continue: z.object({
      uri: z.string().url(),
      access_token: z.object({
        value: z.string()
      }),
      wait: z.number()
    })
  }),
  quote: z.object({
    id: z.string(),
    walletAddress: z.string().url('Invalid wallet address'),
    receiver: z.string().url(),
    receiveAmount: AmountSchema,
    debitAmount: AmountSchema,
    method: z.literal('ilp'),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
    incomingPaymentGrantToken: z.string()
  }),
  interactRef: z.string().min(1, 'Interact reference is required')
})

export const WalletAddressParamSchema = z.object({
  wa: z.string().min(1, 'Wallet address is required'),
  version: z.string().optional().default('default')
})

export type PaymentQuoteInput = z.infer<typeof PaymentQuoteSchema>
export type PaymentGrantInput = z.infer<typeof PaymentGrantSchema>
export type PaymentFinalizeInput = z.infer<typeof PaymentFinalizeSchema>
export type WalletAddressParams = z.infer<typeof WalletAddressParamSchema>
