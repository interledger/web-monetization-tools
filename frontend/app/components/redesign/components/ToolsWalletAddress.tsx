import { Tooltip } from './Tooltip'
import { InputField } from './InputField'
import { ToolsSecondaryButton } from './ToolsSecondaryButton'

export const ToolsWalletAddress = () => {
  return (
    <div className="flex items-start gap-8 p-4 relative bg-white rounded-lg">
      <div className="flex flex-col items-start gap-4 relative flex-1 grow z-[1] bg-white rounded-2xl">
        <div className="flex items-center relative self-stretch w-full flex-[0_0_auto] z-[1]">
          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <h5 className="text-style-h5 relative w-fit mt-[-1.00px]">
              Wallet address
            </h5>

            <Tooltip text="Wallet address must use HTTPS protocol" />
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto] z-0">
          <div className="w-full max-w-[470px]">
            <InputField placeholder="Fill in your wallet address" />
          </div>
        </div>
      </div>{' '}
      <div className="flex flex-col max-w-[490px] items-start gap-5 relative flex-1 grow z-0">
        <div className="relative self-stretch w-full">
          <p className="w-full text-style-small-standard">
            If it is the first time you connect your wallet address to the Web
            Monetization you will start with the default configuration.
            <br />
            Then you will be able to save your custom configuration.
          </p>
        </div>
        <ToolsSecondaryButton className="mix-w-[240px]">
          Continue
        </ToolsSecondaryButton>
      </div>
    </div>
  )
}
