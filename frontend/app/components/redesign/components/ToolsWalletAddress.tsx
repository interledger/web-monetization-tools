import React, { useState } from 'react'
import { useSnapshot } from 'valtio'
import { Tooltip } from './Tooltip'
import { InputField } from './InputField'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'
import { SVGRefresh, SVGSpinner } from '~/assets/svg'
import { toolState, toolActions } from '~/stores/toolStore'
import { APP_BASEPATH } from '~/lib/constants'
import type { ElementErrors } from '~/lib/types'

export const ToolsWalletAddress = () => {
  const snap = useSnapshot(toolState)
  const [error, setError] = useState<ElementErrors>()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
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
    } catch (err) {
      console.error('Failed to fetch config:', err)
      setError({
        fieldErrors: { walletAddress: ['Failed to fetch configuration'] },
        message: []
      })
    } finally {
      setIsLoading(false)
    }
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
              If you&apos;re connecting your wallet address to Web Monetization
              for the first time, you&apos;ll start with the default
              configuration.
              <br />
              You can then customize and save your config as needed.
            </p>
          ) : (
            <p className="w-full text-style-small-standard !text-text-success">
              We&apos;ve loaded your configuration.
              <br />
              Feel free to keep customizing your banner to fit your style.
            </p>
          )}
        </div>
        {!snap.isWalletConnected && (
          <ToolsSecondaryButton
            className="w-[143px]"
            disabled={isLoading}
            onClick={handleContinue}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading && <SVGSpinner />}
              <span>{isLoading ? 'Connecting...' : 'Continue'}</span>
            </div>
          </ToolsSecondaryButton>
        )}
      </div>
    </div>
  )
}
