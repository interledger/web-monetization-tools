import 'express-session'

declare module 'express-session' {
  interface Session {
    validForWallet?: string
  }
}
