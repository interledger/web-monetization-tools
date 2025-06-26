import React, { useState } from 'react'
import { Tooltip } from './Tooltip'
import { InputField } from './InputField'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'
import { SVGRefresh } from '../../../assets/svg'

interface ToolsWalletAddressProps {
  onConnectionChange?: (connected: boolean) => void
}

export const ToolsWalletAddress = ({
  onConnectionChange
}: ToolsWalletAddressProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const handleContinue = () => {
    setWalletAddress('$ilp.interledger-test.dev/e2bddaeb')
    setIsConnected(true)
    onConnectionChange?.(true)
  }

  const handleRefresh = () => {
    setIsConnected(false)
    setWalletAddress('')
    onConnectionChange?.(false)
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
                  isConnected ? undefined : 'Fill in your wallet address'
                }
                value={isConnected ? walletAddress : undefined}
                disabled={isConnected}
              />
            </div>
            {isConnected && (
              <button onClick={handleRefresh}>
                <SVGRefresh className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-[490px] items-start gap-5 relative flex-1 grow z-0">
        <div className="relative self-stretch w-full">
          {!isConnected ? (
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
        {!isConnected && (
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
