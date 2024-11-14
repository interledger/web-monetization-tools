import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import { Input } from './Input.js'

export const WalletAddress = ({
  errors,
  config,
  setToolConfig
}: {
  errors?: ElementErrors
  config: ElementConfigType
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
}) => {
  return (
    <div className="w-full my-4">
      <Input
        name="walletAddress"
        label="Wallet address"
        tooltip="Your wallet address is used for saving your configured component, to confirm you own the component you want to update, as well as being injected into the page you are dislaying the component in, enabling accepting funds through webmonetization."
        placeholder="https://ase-provider-url/jdoe"
        value={config.walletAddress || ''}
        error={errors?.fieldErrors.walletAddress}
        onChange={(e) =>
          setToolConfig({
            ...config,
            walletAddress: e.target.value ?? ''
          })
        }
        withBorder
      />
    </div>
  )
}

WalletAddress.displayName = 'WalletAddress'
