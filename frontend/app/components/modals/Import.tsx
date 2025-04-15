import { Dialog } from '@headlessui/react'
import { useFetcher } from '@remix-run/react'
import type { ElementConfigType } from '~/lib/types.js'
import { XIcon } from '~/components/icons.js'
import { Button } from '~/components/index.js'
import { WalletAddress } from '../WalletAddressInput.js'
import { useEffect } from 'react'

type ImportModalProps = {
  title: string
  isOpen: boolean
  toolConfig: ElementConfigType
  setConfigs: (
    fullConfigObject: Record<string, ElementConfigType>,
    versionName: string
  ) => void
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
  onClose: () => void
  onImport?: (walletAddress: string) => void
}

export const ImportModal = ({
  title,
  isOpen,
  onClose,
  toolConfig,
  setConfigs = () => {},
  setToolConfig = () => {}
}: ImportModalProps) => {
  const validateFetcher = useFetcher()
  const importFetcher = useFetcher()
  const isSubmitting =
    validateFetcher.state !== 'idle' || importFetcher.state !== 'idle'

  useEffect(() => {
    if (
      // @ts-expect-error TODO
      validateFetcher.data?.success &&
      // @ts-expect-error TODO
      validateFetcher.data?.intent === 'import'
    ) {
      const cleanWalletAddress =
        toolConfig.walletAddress?.replace('https://', '') || ''
      importFetcher.load(
        `/api/banner/imports?wa=${encodeURIComponent(cleanWalletAddress)}`
      )
    }
  }, [validateFetcher.data])

  useEffect(() => {
    if (importFetcher.data && importFetcher.state === 'idle') {
      // @ts-expect-error TODO
      if (importFetcher.data.default) {
        // @ts-expect-error TODO
        setConfigs(importFetcher.data, 'default')
        sessionStorage.setItem('fullconfig', JSON.stringify(importFetcher.data))
        onClose()
      }
    }
  }, [importFetcher.data])

  return (
    <Dialog as="div" className="relative z-10" onClose={onClose} open={isOpen}>
      <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg max-w-full transition-all bg-white px-4 pb-4 pt-5 text-left shadow-xl w-full max-w-xl">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-8 w-8" aria-hidden="true" />
              </button>
            </div>
            <div>
              <Dialog.Title
                as="h3"
                className="font-semibold leading-6 text-lg text-center"
              >
                {title}
              </Dialog.Title>
              <div className="mt-2">
                <validateFetcher.Form
                  id="import-form"
                  method="post"
                  action="/create/banner"
                >
                  <fieldset disabled={isSubmitting}>
                    <div className="flex w-full items-center">
                      <WalletAddress
                        // @ts-expect-error TODO
                        errors={validateFetcher.data?.errors}
                        config={toolConfig}
                        setToolConfig={setToolConfig}
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        aria-label={`import config`}
                        disabled={isSubmitting}
                        type="submit"
                        value="import"
                        name="intent"
                      >
                        {isSubmitting ? 'Importing...' : 'Import'}
                      </Button>
                    </div>
                  </fieldset>
                </validateFetcher.Form>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
