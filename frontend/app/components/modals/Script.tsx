import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Form } from '@remix-run/react'
import { XIcon } from '~/components/icons.js'
import { Button, CopyButton, InfoWithTooltip } from '~/components/index.js'
import { removeItem } from '~/lib/utils.js'

type ScriptModalProps = {
  title: string
  tooltip?: string
  defaultType?: string
  scriptForDisplay: string
  selectedVersion: string
  isOpen: boolean
  onClose: () => void
}

const selectableTypes = ['banner', 'widget']

export const ScriptModal = ({
  title,
  tooltip,
  defaultType,
  scriptForDisplay,
  selectedVersion,
  isOpen,
  onClose
}: ScriptModalProps) => {
  const [types, setTypes] = useState([defaultType])
  const [processedScript, setProcessedScript] = useState(scriptForDisplay)

  const chooseType = (selected: string) => {
    if (types.indexOf(selected) != -1) {
      const remaining = removeItem(types, selected)
      setTypes([...remaining])
    } else {
      setTypes([...types, selected])
    }
  }

  useEffect(() => {
    const script = scriptForDisplay
      .replace('[elements]', types.join('|'))
      .replace('[version]', selectedVersion)
    setProcessedScript(script)
  }, [types, scriptForDisplay, selectedVersion])

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
                className="flex font-semibold leading-6 text-lg text-center"
              >
                <span>{title}</span>
                <InfoWithTooltip tooltip={tooltip} />
              </Dialog.Title>
              <div className="mt-2">
                <div className="flex items-center m-6 mb-0 p-2">
                  <span className="flex">Include: </span>
                  {selectableTypes.map((type) => {
                    return (
                      <div className="flex items-center ml-2" key={type}>
                        <input
                          type="checkbox"
                          className="flex w-5 h-5 mr-2"
                          defaultChecked={defaultType == type}
                          onClick={() => chooseType(type)}
                        />
                        <span className="flex">{type}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex">
                  <code className="flex m-6 p-2 max-w-md border border-tealish whitespace-pre-wrap break-all break-words overflow-x-auto block">
                    {processedScript}
                  </code>
                  <div className="flex">
                    <CopyButton
                      aria-label="copy script"
                      className="h-7 w-7"
                      size="sm"
                      value={processedScript}
                      variant="input"
                    ></CopyButton>
                  </div>
                </div>
                <Form method="post" replace preventScrollReset>
                  <div className="flex justify-end space-x-4">
                    <Button
                      aria-label="close modal"
                      type="reset"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
