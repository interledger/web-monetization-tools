import React, { useState } from 'react'
import { useSnapshot } from 'valtio'
import { Tooltip } from './Tooltip'
import { InputField } from './InputField'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'
import { cx } from 'class-variance-authority'
import { SVGRefresh, SVGSpinner } from '~/assets/svg'
import { toolState, toolActions } from '~/stores/toolStore'
import { APP_BASEPATH } from '~/lib/constants'
import type { ElementErrors } from '~/lib/types'
import { Heading5 } from '../Typography'

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
    } catch {
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

    if (snap.walletConnectStep !== 'unfilled') {
      toolActions.setConnectWalletStep('unfilled')
    }
  }
  return (
    <div
      className={cx(
        'flex flex-col xl:flex-row xl:items-start gap-2xl p-md bg-white rounded-lg',
        snap.walletConnectStep === 'error' && 'border border-red-600'
      )}
    >
      <div className="flex flex-col items-start gap-md w-full xl:flex-1 xl:grow">
        <div className="inline-flex items-center gap-xs">
          <Heading5>Wallet address</Heading5>
          <Tooltip>
            Your wallet is required in order for us to save this components
            configuration for you, link it to the original author, and verify
            ownership for future updates. It also embeds the wallet address into
            your web page automatically, enabling Web Monetization on your
            behalf.
          </Tooltip>
        </div>

        <div className="flex items-center w-full">
          <div className="w-full">
            <InputField
              placeholder={
                snap.isWalletConnected
                  ? undefined
                  : 'walletprovider.com/MyWallet'
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

      <div className="flex flex-col w-full xl:max-w-[490px] items-start gap-xs xl:flex-1 xl:grow">
        {snap.walletConnectStep === 'error' ? (
          <p className="w-full text-style-small-standard !text-red-600">
            You have not connected your wallet address yet.
          </p>
        ) : !snap.isWalletConnected ? (
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
        {!snap.isWalletConnected && (
          <ToolsSecondaryButton
            className="xl:w-[143px]"
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
