import { Dialog } from '@headlessui/react'
import { Form } from '@remix-run/react'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import { XIcon } from '~/components/icons.js'
import { Button, Input, WalletAddress } from '~/components/index.js'
import { useState } from 'react'

type NewVersionModalProps = {
  title: string
  isOpen: boolean
  isSubmitting: boolean
  errors?: ElementErrors
  onClose: () => void
  toolConfig: ElementConfigType
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
}

export const NewVersionModal = ({
  title,
  isOpen,
  onClose,
  errors,
  isSubmitting,
  toolConfig,
  setToolConfig
}: NewVersionModalProps) => {
  const [versionName, setVersionName] = useState('')

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
                <Form method="post" replace preventScrollReset>
                  <fieldset disabled={isSubmitting}>
                    <div className="flex w-full items-center">
                      <WalletAddress
                        errors={errors}
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
                          value={versionName}
                          error={errors?.fieldErrors.version}
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
                        disabled={isSubmitting}
                        type="submit"
                        value="newversion"
                        name="intent"
                      >
                        Create
                      </Button>
                    </div>
                  </fieldset>
                </Form>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
