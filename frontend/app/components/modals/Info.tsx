import { Dialog } from '@headlessui/react'
import { XIcon } from '~/components/icons.js'
import { Button } from '~/components/index.js'

type InfoModalProps = {
  title: string
  content: string
  isOpen: boolean
  onClose: () => void
}

export const InfoModal = ({
  title,
  content,
  isOpen,
  onClose
}: InfoModalProps) => {
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
                <fieldset>
                  <div className="flex w-full items-center">{content}</div>
                  <div className="flex justify-end space-x-4">
                    <Button aria-label={`close`} onClick={() => onClose()}>
                      Ok
                    </Button>
                  </div>
                </fieldset>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
