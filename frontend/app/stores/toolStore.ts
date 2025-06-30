import { proxy, subscribe } from 'valtio'
import type { ElementConfigType } from '~/lib/types.js'
import type { ModalType } from '~/lib/presets.js'
import type { SelectOption } from '~/components/index.js'

const STORAGE_KEY = 'valtio-store'

export const toolState = proxy({
  toolConfig: null as ElementConfigType | null,
  fullConfig: {} as Record<string, ElementConfigType>,

  selectedVersion: 'tab1',
  versionOptions: [
    { label: 'Default preset 1', value: 'tab1' },
    { label: 'Default preset 2', value: 'tab2' },
    { label: 'Default preset 3', value: 'tab3' }
  ] as SelectOption[],

  modal: undefined as ModalType | undefined,

  isSubmitting: false,
  fetcherState: 'idle' as 'idle' | 'loading' | 'submitting',

  elementType: null as string | null,
  scriptInitUrl: '',
  apiUrl: '',
  opWallet: '',
  walletAddress: '',
  grantResponse: null as unknown,
  isGrantResponse: false,
  isGrantAccepted: false,
  lastAction: null as unknown,

  isWalletConnected: false,
  isBuildStepComplete: false,
  activeStep: 1
})

export const toolActions = {
  setToolConfig: (config: Partial<ElementConfigType>) => {
    toolState.toolConfig = {
      ...toolState.toolConfig,
      ...config
    } as ElementConfigType
  },

  setFullConfig: (fullConfig: Record<string, ElementConfigType>) => {
    toolState.fullConfig = fullConfig
  },

  setConfigs: (fullConfigObject: Record<string, ElementConfigType>) => {
    const allKeys = Object.keys(fullConfigObject)
    const firstThreeKeys = allKeys.slice(0, 3)

    const versionLabels = firstThreeKeys.map((key) => {
      return {
        label: key.charAt(0).toUpperCase() + key.slice(1).replaceAll('-', ' '),
        value: key
      }
    })
    console.log('!!! versionLabels (first 3):', versionLabels)
    toolState.versionOptions = versionLabels
    toolState.fullConfig = fullConfigObject

    const firstVersion = toolState.versionOptions[0].value
    toolState.selectedVersion = firstVersion
    toolState.toolConfig = fullConfigObject[firstVersion]
  },

  selectVersion: (selectedVersion: string) => {
    const config = toolState.fullConfig[selectedVersion]
    if (config) {
      toolState.toolConfig = config
      toolState.selectedVersion = selectedVersion
    } else {
      throw new Error('Version not found')
    }
  },

  setModal: (modal: ModalType | undefined) => {
    toolState.modal = modal
  },

  setSubmitting: (isSubmitting: boolean) => {
    toolState.isSubmitting = isSubmitting
  },

  setFetcherState: (state: 'idle' | 'loading' | 'submitting') => {
    toolState.fetcherState = state
  },

  setWalletConnected: (connected: boolean) => {
    toolState.isWalletConnected = connected
    if (connected) {
      toolState.activeStep = Math.max(toolState.activeStep, 2)
    }
  },

  setBuildStepComplete: (complete: boolean) => {
    toolState.isBuildStepComplete = complete
    if (complete) {
      toolState.activeStep = Math.max(toolState.activeStep, 3)
    }
  },

  setActiveStep: (step: number) => {
    toolState.activeStep = step
  },

  getScriptToDisplay: (): string | undefined => {
    if (!toolState.toolConfig?.walletAddress) {
      return undefined
    }

    const wa = toolState.toolConfig.walletAddress
      .replace('$', '')
      .replace('https://', '')
    return `<script id="wmt-init-script" type="module" src="${toolState.scriptInitUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`
  },

  updateVersionLabel: (versionValue: string, newLabel: string) => {
    toolState.versionOptions = toolState.versionOptions.map((option) =>
      option.value === versionValue ? { ...option, label: newLabel } : option
    )
  },

  setWalletAddress: (walletAddress: string) => {
    toolState.walletAddress = walletAddress

    // Update the wallet address in the current toolConfig
    // if (toolState.toolConfig) {
    //   toolState.toolConfig = {
    //     ...toolState.toolConfig,
    //     walletAddress: walletAddress
    //   }

    //   // Update the fullConfig with the current version's updated config
    //   toolState.fullConfig = {
    //     ...toolState.fullConfig,
    //     [toolState.selectedVersion]: toolState.toolConfig
    //   }
    // }
  }
}

/** Load from localStorage on init */
export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    Object.assign(toolState, parsed)
  }
}

export function persistState() {
  subscribe(toolState, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toolState))
  })
}
