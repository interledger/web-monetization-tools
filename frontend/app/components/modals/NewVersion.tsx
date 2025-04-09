import { Dialog } from '@headlessui/react'
import { useFetcher } from '@remix-run/react'
import { ElementConfigType } from '~/lib/types.js'
import { XIcon } from '~/components/icons.js'
import { Button, Input, WalletAddress } from '~/components/index.js'
import { useEffect, useState } from 'react'
import { ModalType } from '~/lib/presets'

type NewVersionModalProps = {
  title: string
  isOpen: boolean
  onClose: () => void
  toolConfig: ElementConfigType
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
  setConfigs: (
    config: Record<string, ElementConfigType>,
    versionName: string
  ) => void
  setModalOpen: React.Dispatch<React.SetStateAction<ModalType | undefined>>
}

export const NewVersionModal = ({
  title,
  isOpen,
  onClose,
  toolConfig,
  setToolConfig,
  setConfigs,
  setModalOpen
}: NewVersionModalProps) => {
  const validateFetcher = useFetcher()
  const versionFetcher = useFetcher()
  const isSubmitting =
    versionFetcher.state !== 'idle' || validateFetcher.state !== 'idle'
  const [versionName, setVersionName] = useState('')

  useEffect(() => {
    // @ts-ignore
    if (validateFetcher.data?.grantRequired) {
      onClose()
      setModalOpen({
        type: 'wallet-ownership',
        // @ts-ignore
        param: validateFetcher.data.grantRequired
      })
    }
    if (
      // @ts-ignore
      validateFetcher.data?.success &&
      // @ts-ignore
      validateFetcher.data?.intent == 'newversion'
    ) {
      try {
        const formData = new FormData()
        formData.append('operation', 'create')
        formData.append('walletAddress', toolConfig?.walletAddress || '')
        formData.append('version', versionName)

        versionFetcher.submit(formData, {
          method: 'post',
          action: '/api/banner/create',
          encType: 'multipart/form-data'
        })
      } catch (error) {
        throw error
      }
    }
  }, [validateFetcher.data])

  useEffect(() => {
    if (versionFetcher.data && versionFetcher.state === 'idle') {
      // @ts-ignore
      if (versionFetcher.data.default) {
        sessionStorage.setItem(
          'fullconfig',
          JSON.stringify(versionFetcher.data)
        )
        sessionStorage.setItem('new-version', versionName)
        // @ts-ignore
        setConfigs(versionFetcher.data, versionName)
        onClose()
      }
    }
  }, [versionFetcher.data, versionFetcher.state])

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
                  id="new-version-form"
                  method="post"
                  action="/create/banner"
                >
                  <fieldset disabled={isSubmitting}>
                    <div className="flex w-full items-center">
                      <WalletAddress
                        //@ts-ignore
                        errors={validateFetcher.data?.errors}
                        config={toolConfig}
                        setToolConfig={setToolConfig}
                      />
                    </div>
                    <div className="flex w-full items-center">
                      <div className="w-full my-4">
                        <Input
                          name="version"
                          label="Version title"
                          placeholder="Default"
                          value={versionName ?? ''}
                          error={
                            // @ts-ignore
                            versionFetcher.data?.errors?.fieldErrors?.version
                          }
                          onChange={(e) => {
                            const newValue = e.target.value
                            if (/^[a-zA-Z0-9-_ ]*$/.test(newValue)) {
                              setVersionName(newValue)
                            }
                          }}
                          withBorder
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        aria-label={`new config`}
                        disabled={isSubmitting || !versionName}
                        type="submit"
                        value="newversion"
                        name="intent"
                      >
                        {isSubmitting ? 'Creating...' : 'Create'}
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
