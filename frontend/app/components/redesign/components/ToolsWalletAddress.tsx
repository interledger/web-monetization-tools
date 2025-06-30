import React, { useState } from 'react'
import { useSnapshot } from 'valtio'
import { Tooltip } from './Tooltip'
import { InputField } from './InputField'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'
import { SVGRefresh } from '../../../assets/svg'
import { toolState, toolActions } from '~/stores/toolStore'
import { APP_BASEPATH } from '~/lib/constants'
import type { ElementErrors } from '~/lib/types'

export const ToolsWalletAddress = () => {
  const snap = useSnapshot(toolState)
  const [error, setError] = useState<ElementErrors>()

  const handleContinue = async () => {
    const response = await fetch(
      `${APP_BASEPATH}/api/config/banner?walletAddress=${snap.walletAddress}`
    )

    if (!response.ok) {
      const data = await response.json()
      // @ts-expect-error TODO
      setError(data.errors)
      return
    }

    const data = await response.json()

    // @ts-expect-error TODO
    if (data.default) {
      // @ts-expect-error TODO
      toolActions.setConfigs(data, 'default')
      setError(undefined)
    }

    toolActions.setWalletConnected(true)
  }

  const handleRefresh = () => {
    toolActions.setWalletConnected(false)
    toolActions.setWalletAddress('')
  }

  const handleWalletAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    toolActions.setWalletAddress(e.target.value)
  }
  return (
    <div className="flex items-start gap-8 p-4 relative bg-white rounded-lg min-h-[165px]">
      <div className="flex flex-col items-start gap-4 relative flex-1 grow z-[1] bg-white rounded-2xl">
        <div className="flex items-center relative self-stretch w-full flex-[0_0_auto] z-[1]">
          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <h5 className="text-style-h5 relative w-fit mt-[-1.00px]">
              Wallet address
            </h5>

            <Tooltip>
              Your wallet is required in order for us to save this components
              configuration for you, link it to the original author, and verify
              ownership for future updates. It also embeds the wallet address
              into your web page automatically, enabling Web Monetization on
              your behalf.
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto] z-0">
          <div className="flex items-center gap-3 w-full">
            <div className="w-[470px]">
              <InputField
                placeholder={
                  snap.isWalletConnected
                    ? undefined
                    : 'Fill in your wallet address'
                }
                value={snap.walletAddress || ''}
                onChange={handleWalletAddressChange}
                disabled={snap.isWalletConnected}
                error={error?.fieldErrors.walletAddress}
              />
            </div>
            {snap.isWalletConnected && (
              <button onClick={handleRefresh}>
                <SVGRefresh className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-[490px] items-start gap-5 relative flex-1 grow z-0">
        <div className="relative self-stretch w-full">
          {!snap.isWalletConnected ? (
            <p className="w-full text-style-small-standard">
              If it is the first time you connect your wallet address to the Web
              Monetization you will start with the default configuration.
              <br />
              Then you will be able to save your custom configuration.
            </p>
          ) : (
            <p className="w-full text-style-small-standard !text-text-success">
              There are no custom changes for the drawer banner associated with
              this wallet address, but you can start customizing whenever you
              want.
            </p>
          )}
        </div>
        {!snap.isWalletConnected && (
          <ToolsSecondaryButton
            className="mix-w-[240px]"
            onClick={handleContinue}
          >
            Continue
          </ToolsSecondaryButton>
        )}
      </div>
    </div>
  )
}
