/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCRIPT_FRONTEND_URL: string
  readonly VITE_SCRIPT_API_URL: string
  readonly VITE_SCRIPT_ILPAY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
