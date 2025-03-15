import { Dialog } from '@headlessui/react'
import { Form } from '@remix-run/react'
import { ElementErrors } from '~/lib/types.js'
import { XIcon } from '~/components/icons.js'
import { Button } from '~/components/index.js'

type WalletOwnershipModalProps = {
  title: string
  walletAddress?: string
  isOpen: boolean
  errors?: ElementErrors
  onClose: () => void
  onConfirm: () => void
}

export const WalletOwnershipModal = ({
  title,
  walletAddress,
  isOpen,
  onClose,
  onConfirm
}: WalletOwnershipModalProps) => {
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
                <span className="flex w-full justify-center text-center">
                  {walletAddress}
                </span>
              </Dialog.Title>
              <div className="mt-2">
                <Form method="post" replace preventScrollReset>
                  <fieldset>
                    <div className="flex justify-center space-x-4">
                      <Button
                        className="mx-0"
                        aria-label={`confirm`}
                        onClick={onConfirm}
                      >
                        Continue
                      </Button>
                      <Button aria-label={`close`} onClick={onClose}>
                        Cancel
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
